import { withAsyncErrorHandling } from './withAsyncErrorHandling';
import { carrierCodeSchema } from '../domain/entities';
import { z } from 'zod-http-schemas';
import {
  QuoteCarrierResult,
  quoteCarrier,
} from '../domain/operations/quoteCarrier';

const carrierQuoteRequestSchema = z.object({
  carriers: z.array(carrierCodeSchema),
});

const urlParamsSchema = z.object({
  id: z.string().nonempty(),
});

export const handlePostOrderQuotes = withAsyncErrorHandling(
  async (req, res) => {
    const bodyParseResult = carrierQuoteRequestSchema.safeParse(req.body);
    if (!bodyParseResult.success) {
      res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        validationError: bodyParseResult.error,
      });
      return;
    }

    const urlParamsParseResult = urlParamsSchema.safeParse(req.params);
    if (!urlParamsParseResult.success) {
      res.status(400).json({
        error: 'INVALID_URL_PARAMETER',
        validationError: urlParamsParseResult.error,
      });
      return;
    }

    const orderId = urlParamsParseResult.data.id;
    const { carriers } = bodyParseResult.data;

    const result = await quoteCarrier(orderId, carriers);

    const outcomeStatusCodeMap: Record<QuoteCarrierResult['outcome'], number> =
      {
        SUCCESS: 200,
        ORDER_ALREADY_BOOKED: 400,
        ORDER_NOT_FOUND: 404,
      };

    res.status(outcomeStatusCodeMap[result.outcome]).json(result);
  }
);
