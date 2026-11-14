import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface TrackingEvent {
  id: string;
  orderId: string;
  status: string;
  title: string;
  description: string;
  location?: string;
  timestamp: string;
}

export interface Order {
  id: string;
  trackingNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  city?: string;
  pincode?: string;
  items: any[];
  customBoxSpecs?: any;
  customNotes?: string;
  giftMessage?: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  courierName: string;
  estimatedDelivery: string;
  currentCheckpoint?: string;
  createdAt: string;
  updatedAt: string;
  trackingEvents: TrackingEvent[];
}

@Injectable()
export class OrdersService {
  private inMemoryOrders: Order[] = [];

  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private generateTrackingNumber(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'MLV-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-' + chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  }

  async createOrder(data: {
    userId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    shippingAddress: string;
    city?: string;
    pincode?: string;
    items: any[];
    customBoxSpecs?: any;
    customNotes?: string;
    giftMessage?: string;
    totalAmount: number;
    paymentMethod: string;
  }): Promise<Order> {
    const id = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const trackingNumber = this.generateTrackingNumber();
    const now = new Date().toISOString();

    const initialEvent: TrackingEvent = {
      id: `evt-${Date.now()}-1`,
      orderId: id,
      status: 'ORDER_CONFIRMED',
      title: 'Order Confirmed & Payment Verified',
      description: `Payment of ₹${data.totalAmount.toLocaleString()} verified. Your custom artisanal order has been entered into the Melvi kitchen queue.`,
      location: 'Melvi Master Atelier',
      timestamp: now,
    };

    const craftingEvent: TrackingEvent = {
      id: `evt-${Date.now()}-2`,
      orderId: id,
      status: 'ARTISAN_CRAFTING',
      title: 'Artisan Handcrafting Commenced',
      description: 'Master chocolatiers are hand-piping your selected ganaches and preparing custom box presentation.',
      location: 'Melvi Atelier Bay 1',
      timestamp: new Date(Date.now() + 1000 * 60 * 2).toISOString(),
    };

    const order: Order = {
      id,
      trackingNumber,
      userId: data.userId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      shippingAddress: data.shippingAddress,
      city: data.city || 'Mumbai',
      pincode: data.pincode || '400001',
      items: data.items,
      customBoxSpecs: data.customBoxSpecs,
      customNotes: data.customNotes,
      giftMessage: data.giftMessage,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod || 'Online (Card/UPI)',
      paymentStatus: 'PAID',
      orderStatus: 'ARTISAN_CRAFTING',
      courierName: 'Melvi Cold-Chain Express',
      estimatedDelivery: 'Within 24-48 Hours (Melt-Proof Courier)',
      currentCheckpoint: 'Artisan Kitchen - Fresh batch preparation under 18°C',
      createdAt: now,
      updatedAt: now,
      trackingEvents: [initialEvent, craftingEvent],
    };

    // Store in PostgreSQL if connected
    if (this.db.isConnected) {
      try {
        await this.db.query(
          `INSERT INTO orders (
            id, tracking_number, user_id, customer_name, customer_email, customer_phone,
            shipping_address, city, pincode, items_json, custom_box_specs, custom_notes,
            gift_message, total_amount, payment_method, payment_status, order_status,
            courier_name, estimated_delivery, current_checkpoint, created_at, updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
          [
            order.id,
            order.trackingNumber,
            order.userId || null,
            order.customerName,
            order.customerEmail,
            order.customerPhone || null,
            order.shippingAddress,
            order.city || null,
            order.pincode || null,
            JSON.stringify(order.items),
            order.customBoxSpecs ? JSON.stringify(order.customBoxSpecs) : null,
            order.customNotes || null,
            order.giftMessage || null,
            order.totalAmount,
            order.paymentMethod,
            order.paymentStatus,
            order.orderStatus,
            order.courierName,
            order.estimatedDelivery,
            order.currentCheckpoint,
            order.createdAt,
            order.updatedAt,
          ]
        );

        for (const evt of order.trackingEvents) {
          await this.db.query(
            `INSERT INTO tracking_events (id, order_id, status, title, description, location, timestamp)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [evt.id, evt.orderId, evt.status, evt.title, evt.description, evt.location, evt.timestamp]
          );
        }
      } catch (err) {
        console.warn('DB insert fallback for order:', err.message);
      }
    }

    // Always maintain in-memory list as well for seamless instant access
    this.inMemoryOrders.unshift(order);
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    if (this.db.isConnected) {
      try {
        const res = await this.db.query('SELECT * FROM orders ORDER BY created_at DESC');
        const orders: Order[] = [];
          for (const row of res.rows) {
            const evtsRes = await this.db.query(
              'SELECT * FROM tracking_events WHERE order_id = $1 ORDER BY timestamp ASC',
              [row.id]
            );
            orders.push({
              id: row.id,
              trackingNumber: row.tracking_number,
              userId: row.user_id,
              customerName: row.customer_name,
              customerEmail: row.customer_email,
              customerPhone: row.customer_phone,
              shippingAddress: row.shipping_address,
              city: row.city,
              pincode: row.pincode,
              items: typeof row.items_json === 'string' ? JSON.parse(row.items_json) : row.items_json,
              customBoxSpecs: typeof row.custom_box_specs === 'string' ? JSON.parse(row.custom_box_specs) : row.custom_box_specs,
              customNotes: row.custom_notes,
              giftMessage: row.gift_message,
              totalAmount: parseFloat(row.total_amount),
              paymentMethod: row.payment_method,
              paymentStatus: row.payment_status,
              orderStatus: row.order_status,
              courierName: row.courier_name,
              estimatedDelivery: row.estimated_delivery,
              currentCheckpoint: row.current_checkpoint,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
              trackingEvents: evtsRes.rows.map(e => ({
                id: e.id,
                orderId: e.order_id,
                status: e.status,
                title: e.title,
                description: e.description,
                location: e.location,
                timestamp: e.timestamp,
              })),
            });
          }
          return orders;
      } catch (err) {
        console.warn('DB getAllOrders fallback:', err.message);
      }
    }
    return this.inMemoryOrders;
  }

  async getUserOrders(userIdOrEmail: string): Promise<Order[]> {
    const clean = (userIdOrEmail || '').toLowerCase().trim();

    if (this.db.isConnected) {
      try {
        const res = await this.db.query(
          'SELECT * FROM orders WHERE user_id = $1 OR LOWER(customer_email) = $1 ORDER BY created_at DESC',
          [clean]
        );
        const orders: Order[] = [];
        for (const row of res.rows) {
            const evtsRes = await this.db.query(
              'SELECT * FROM tracking_events WHERE order_id = $1 ORDER BY timestamp ASC',
              [row.id]
            );
            orders.push({
              id: row.id,
              trackingNumber: row.tracking_number,
              userId: row.user_id,
              customerName: row.customer_name,
              customerEmail: row.customer_email,
              customerPhone: row.customer_phone,
              shippingAddress: row.shipping_address,
              city: row.city,
              pincode: row.pincode,
              items: typeof row.items_json === 'string' ? JSON.parse(row.items_json) : row.items_json,
              customBoxSpecs: typeof row.custom_box_specs === 'string' ? JSON.parse(row.custom_box_specs) : row.custom_box_specs,
              customNotes: row.custom_notes,
              giftMessage: row.gift_message,
              totalAmount: parseFloat(row.total_amount),
              paymentMethod: row.payment_method,
              paymentStatus: row.payment_status,
              orderStatus: row.order_status,
              courierName: row.courier_name,
              estimatedDelivery: row.estimated_delivery,
              currentCheckpoint: row.current_checkpoint,
              createdAt: row.created_at,
              updatedAt: row.updated_at,
              trackingEvents: evtsRes.rows.map(e => ({
                id: e.id,
                orderId: e.order_id,
                status: e.status,
                title: e.title,
                description: e.description,
                location: e.location,
                timestamp: e.timestamp,
              })),
            });
          }
          return orders;
      } catch (err) {
        console.warn('DB getUserOrders notice, using fallback:', err.message);
      }
    }

    return this.inMemoryOrders.filter(
      o => o.userId === clean || o.customerEmail.toLowerCase() === clean
    );
  }

  async trackOrder(identifier: string): Promise<Order> {
    const clean = (identifier || '').trim();

    if (this.db.isConnected) {
      try {
        const res = await this.db.query(
          'SELECT * FROM orders WHERE id = $1 OR UPPER(tracking_number) = UPPER($1)',
          [clean]
        );
        if (res.rows.length > 0) {
          const row = res.rows[0];
          const evtsRes = await this.db.query(
            'SELECT * FROM tracking_events WHERE order_id = $1 ORDER BY timestamp ASC',
            [row.id]
          );
          return {
            id: row.id,
            trackingNumber: row.tracking_number,
            userId: row.user_id,
            customerName: row.customer_name,
            customerEmail: row.customer_email,
            customerPhone: row.customer_phone,
            shippingAddress: row.shipping_address,
            city: row.city,
            pincode: row.pincode,
            items: typeof row.items_json === 'string' ? JSON.parse(row.items_json) : row.items_json,
            customBoxSpecs: typeof row.custom_box_specs === 'string' ? JSON.parse(row.custom_box_specs) : row.custom_box_specs,
            customNotes: row.custom_notes,
            giftMessage: row.gift_message,
            totalAmount: parseFloat(row.total_amount),
            paymentMethod: row.payment_method,
            paymentStatus: row.payment_status,
            orderStatus: row.order_status,
            courierName: row.courier_name,
            estimatedDelivery: row.estimated_delivery,
            currentCheckpoint: row.current_checkpoint,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            trackingEvents: evtsRes.rows.map(e => ({
              id: e.id,
              orderId: e.order_id,
              status: e.status,
              title: e.title,
              description: e.description,
              location: e.location,
              timestamp: e.timestamp,
            })),
          };
        }
      } catch (err) {
        console.warn('DB trackOrder fallback:', err.message);
      }
    }

    const found = this.inMemoryOrders.find(
      o => o.trackingNumber.toUpperCase() === clean.toUpperCase() || o.id === clean
    );

    if (!found) {
      throw new NotFoundException(`No order found matching reference "${identifier}". Please check the reference code.`);
    }

    return found;
  }

  async updateTrackingStatus(
    orderId: string,
    update: {
      status: string;
      title?: string;
      description?: string;
      location?: string;
      courierName?: string;
      estimatedDelivery?: string;
    }
  ): Promise<Order> {
    const statusTitles: Record<string, string> = {
      ORDER_CONFIRMED: 'Order Verified',
      ARTISAN_CRAFTING: 'Tempering & Bonbon Crafting',
      CUSTOM_PACKAGING: 'Custom Box Packaging & Gold Seal',
      QUALITY_INSPECTION: 'Quality & Temperature Inspection Passed',
      DISPATCHED: 'Dispatched in Cold-Chain Box',
      IN_TRANSIT: 'In Transit via Insulated Express',
      OUT_FOR_DELIVERY: 'Out for Courier Delivery',
      DELIVERED: 'Package Successfully Delivered',
    };

    const statusDescriptions: Record<string, string> = {
      ORDER_CONFIRMED: 'Order specifications and payment confirmed. Assigned to chocolatiers.',
      ARTISAN_CRAFTING: 'Chocolatiers have hand-piped the ganache fillings and topped with gold flakes and orange zest.',
      CUSTOM_PACKAGING: 'Chocolates nested in luxury ballotin, customer requirement note enclosed, and hand-tied with silk ribbon.',
      QUALITY_INSPECTION: 'Passed surface gloss inspection and placed into 16°C thermal cold-pack insulation.',
      DISPATCHED: 'Handed over to specialized refrigerated express logistics carrier.',
      IN_TRANSIT: 'Traveling in climate-controlled temperature-regulated vehicle to local destination hub.',
      OUT_FOR_DELIVERY: 'Our delivery specialist is en route to customer doorstep with cold-pouch container.',
      DELIVERED: 'Delivered in immaculate condition. Bon appétit!',
    };

    const now = new Date().toISOString();
    const eventTitle = update.title || statusTitles[update.status] || `Status updated to ${update.status}`;
    const eventDesc = update.description || statusDescriptions[update.status] || 'Package progress milestone recorded.';
    const eventLocation = update.location || 'Melvi Hub';

    const newEvent: TrackingEvent = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId,
      status: update.status,
      title: eventTitle,
      description: eventDesc,
      location: eventLocation,
      timestamp: now,
    };

    // Update in DB
    if (this.db.isConnected) {
      try {
        await this.db.query(
          `UPDATE orders SET
            order_status = $1,
            current_checkpoint = $2,
            courier_name = COALESCE($3, courier_name),
            estimated_delivery = COALESCE($4, estimated_delivery),
            updated_at = $5
           WHERE id = $6 OR UPPER(tracking_number) = UPPER($6)`,
          [
            update.status,
            `${eventTitle} - ${eventLocation}`,
            update.courierName || null,
            update.estimatedDelivery || null,
            now,
            orderId,
          ]
        );

        await this.db.query(
          `INSERT INTO tracking_events (id, order_id, status, title, description, location, timestamp)
           VALUES ($1, (SELECT id FROM orders WHERE id = $2 OR UPPER(tracking_number) = UPPER($2) LIMIT 1), $3, $4, $5, $6, $7)`,
          [newEvent.id, orderId, newEvent.status, newEvent.title, newEvent.description, newEvent.location, newEvent.timestamp]
        );

        return await this.trackOrder(orderId);
      } catch (err) {
        console.warn('DB updateTrackingStatus fallback:', err.message);
      }
    }

    // Update in-memory
    const order = this.inMemoryOrders.find(
      o => o.id === orderId || o.trackingNumber.toUpperCase() === orderId.toUpperCase()
    );
    if (order) {
      order.orderStatus = update.status;
      order.currentCheckpoint = `${eventTitle} - ${eventLocation}`;
      if (update.courierName) order.courierName = update.courierName;
      if (update.estimatedDelivery) order.estimatedDelivery = update.estimatedDelivery;
      order.updatedAt = now;
      order.trackingEvents.push(newEvent);
      return order;
    }

    return this.trackOrder(orderId);
  }
}
