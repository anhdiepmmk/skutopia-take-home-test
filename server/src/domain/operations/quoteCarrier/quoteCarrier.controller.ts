import { CarrierCode, Order } from '../../entities';
import { ordersRepo } from '../../../repos/ordersRepo';
import {
  QuoteCarrierResult,
  deriveQuoteCarrierOutcome,
} from './quoteCarrier.deriver';

export const quoteCarrier = async (
  orderId: Order['id'],
  carriers: Array<CarrierCode>
): Promise<QuoteCarrierResult> => {
  const order = await ordersRepo.getOrder(orderId);

  const result = deriveQuoteCarrierOutcome(order, carriers);

  if (result.outcome === 'SUCCESS') {
    await ordersRepo.updateOrder({ ...result.order });
  }
  return result;
};

export { QuoteCarrierResult };
