import { CarrierCode, CarrierQuote, Order, OrderItem } from '../../entities';

type Success = {
  outcome: 'SUCCESS';
  order: Order;
};
type OrderNotFound = {
  outcome: 'ORDER_NOT_FOUND';
};
type OrderAlreadyBooked = {
  outcome: 'ORDER_ALREADY_BOOKED';
};

export type QuoteCarrierResult = Success | OrderNotFound | OrderAlreadyBooked;

const calculateCarrierFees = (
  carrier: CarrierCode,
  items: Array<OrderItem>
): number => {
  switch (carrier) {
    case 'UPS':
      return items.reduce((acc, item) => acc + item.gramsPerItem * 0.05, 800);
    case 'USPS':
      return items.reduce((acc, item) => acc + item.gramsPerItem * 0.02, 1050);
    case 'FEDEX':
      return items.reduce((acc, item) => acc + item.gramsPerItem * 0.03, 1000);
    default:
      throw new Error(`Unknown carrier: ${carrier}`);
  }
};

export const deriveQuoteCarrierOutcome = (
  order: Order | undefined,
  carriers: Array<CarrierCode>
): QuoteCarrierResult => {
  if (!order) {
    return {
      outcome: 'ORDER_NOT_FOUND',
    };
  }
  if (order.status === 'BOOKED') {
    return {
      outcome: 'ORDER_ALREADY_BOOKED',
    };
  }

  const quotes: Array<CarrierQuote> = carriers.map((carrier) => {
    return {
      carrier,
      priceCents: calculateCarrierFees(carrier, order.items),
    };
  });

  return {
    outcome: 'SUCCESS',
    order: {
      ...order,
      status: 'QUOTED',
      quotes,
    },
  };
};
