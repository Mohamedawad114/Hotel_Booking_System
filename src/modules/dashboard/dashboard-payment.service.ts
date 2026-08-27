import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { paymentStatus } from '@prisma/client';
import dayjs from 'dayjs';
import {
  BookingRepository,
  decoderCursor,
  encodedCursor,
  PaymentRepository,
  redis,
  redisKeys,
  TTL,
} from 'src/common';
import { GetBookingsDto } from './Dto/getBookings.dto';

@Injectable()
export class DashboardPaymentService {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly bookingRepo: BookingRepository,
  ) {}
  async getAllPayments(data: GetBookingsDto) {
    const cached = await redis.get(redisKeys.dashboardPayments(data));
    if (cached) return JSON.parse(cached);
    const dateFilter = this.getDateFilter(data.day, data.month);
    const decodedCursor = decoderCursor(data.cursor);
    const payments = await this.paymentRepo.findMany(
      { ...(dateFilter ? { createdAt: dateFilter } : {}) },
      {
        skip: decodedCursor ? 1 : 0,
        cursor: decodedCursor
          ? { id: decodedCursor.id, createdAt: decodedCursor.value }
          : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: data.limit,
        select: {
          id: true,
          amount: true,
          currency: true,
          paymentId: true,
          gateway: true,
          status: true,
          paidAt: true,
          createdAt: true,
        },
      },
    );
    const lastItem = payments[payments.length - 1];
    const nextCursor = encodedCursor({
      id: lastItem.id,
      value: lastItem.createdAt,
    });
    const res = {
      message: 'payments',
      data: payments,
      meta: { nextCursor },
    };
    await redis.setex(
      redisKeys.dashboardPayments({ ...data, cursor: nextCursor }),
      TTL.dashboard,
      JSON.stringify(res),
    );
    return res;
  }
  async getPaymentDetails(id: number) {
    const payment = await this.paymentRepo.findById(id, {
      include: {
        user: { select: { id: true, name: true, email: true } },
        booking: { select: { bookingNumber: true } },
      },
    });
    if (!payment) throw new NotFoundException('payment not found');
    return { message: 'payment details', data: payment };
  }
  async getSummary() {
    const now = dayjs();
    const dayStart = now.startOf('day').toDate();
    const dayEnd = now.add(1, 'day').startOf('day').toDate();
    const monthStart = now.startOf('month').toDate();
    const monthEnd = now.add(1, 'month').startOf('month').toDate();
    const completedPaymentFilter = {
      status: paymentStatus.completed,
      paidAt: { not: null },
    };
    const [dailyPayments, monthlyPayments, dailyBookings] = await Promise.all([
      this.paymentRepo.findMany(
        { ...completedPaymentFilter, paidAt: { gte: dayStart, lt: dayEnd } },
        { select: { amount: true, currency: true } },
      ),
      this.paymentRepo.findMany(
        {
          ...completedPaymentFilter,
          paidAt: { gte: monthStart, lt: monthEnd },
        },
        { select: { amount: true, currency: true } },
      ),
      this.bookingRepo.count({ createdAt: { gte: dayStart, lt: dayEnd } }),
    ]);
    const sum = (payments: Array<{ amount: number }>) =>
      payments.reduce((total, payment) => total + payment.amount, 0);
    return {
      message: 'dashboard payment summary',
      data: {
        dailyIncome: sum(dailyPayments),
        monthlyIncome: sum(monthlyPayments),
        dailyBookings,
      },
    };
  }

  private getDateFilter(day?: string, month?: string) {
    if (day) {
      const parsedDay = dayjs(day, 'YYYY-MM-DD', true);
      if (!parsedDay.isValid()) throw new BadRequestException('day is invalid');
      return {
        gte: parsedDay.startOf('day').toDate(),
        lt: parsedDay.add(1, 'day').startOf('day').toDate(),
      };
    }
    if (month) {
      const parsedMonth = dayjs(month, 'YYYY-MM', true);
      if (!parsedMonth.isValid())
        throw new BadRequestException('month is invalid');
      return {
        gte: parsedMonth.startOf('month').toDate(),
        lt: parsedMonth.add(1, 'month').startOf('month').toDate(),
      };
    }
    return undefined;
  }
}
