import { expect } from 'chai';
import { Order } from '../../entities';
import { deriveQuoteCarrierOutcome } from './quoteCarrier.deriver';

const mockOrder: Order = {
  id: '123',
  customer: 'Sally Bob',
  items: [
    {
      sku: 'SHOE-RED-1',
      quantity: 1,
      gramsPerItem: 100,
      price: 20,
    },
  ],
  quotes: [],
  status: 'RECEIVED',
};

describe('quoteCarrier.deriver', () => {
  it('returns ORDER NOT FOUND when passed an undefined order', () => {
    const result = deriveQuoteCarrierOutcome(undefined, ['UPS']);
    expect(result.outcome).to.eq('ORDER_NOT_FOUND');
  });
  it('returns ORDER ALREADY BOOKED when passed a booked order', () => {
    const result = deriveQuoteCarrierOutcome(
      {
        ...mockOrder,
        status: 'BOOKED',
      },
      ['UPS']
    );
    expect(result.outcome).to.eq('ORDER_ALREADY_BOOKED');
  });
  it('returns SUCCESS when quote a valid booking', () => {
    const order: Order = {
      ...mockOrder,
      status: 'RECEIVED',
    };
    const result = deriveQuoteCarrierOutcome(
      {
        ...order,
      },
      ['UPS']
    );
    expect(result).to.deep.eq({
      outcome: 'SUCCESS',
      order: {
        ...order,
        status: 'QUOTED',
        quotes: [
          {
            carrier: 'UPS',
            priceCents: 805,
          },
        ],
      },
    });
  });
});
