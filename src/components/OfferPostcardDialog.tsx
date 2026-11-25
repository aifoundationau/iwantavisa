import React from 'react';
import { RatingSummary } from '../lib/reviews';
import { MerchantOffer } from '../types/contracts';
import { MerchantOfferPostcard } from './MerchantOfferPostcard';
import { PostcardDialog } from './PostcardDialog';

interface OfferPostcardDialogProps {
  offer: MerchantOffer;
  rating: RatingSummary;
  onOpenReviews?: (merchantId: string) => void;
  /** Omit for the merchant's own postcards. */
  onMessage?: (offer: MerchantOffer) => void;
  onClose: () => void;
}

/** The full postcard (message, address, every share button), opened from a compact grid card. */
export const OfferPostcardDialog: React.FC<OfferPostcardDialogProps> = ({
  offer,
  rating,
  onOpenReviews,
  onMessage,
  onClose,
}) => {
  const idPrefix = `open-${offer.id}`;
  // Reviews and messages open their own dialog, so this one steps aside first.
  return (
    <PostcardDialog
      titleId={`offer-headline-${idPrefix}`}
      testId="offer-dialog"
      closeTestId="close-offer-dialog-btn"
      onClose={onClose}
    >
      <MerchantOfferPostcard
        offer={offer}
        idPrefix={idPrefix}
        rating={rating}
        onOpenReviews={
          onOpenReviews &&
          ((merchantId) => {
            onClose();
            onOpenReviews(merchantId);
          })
        }
        onMessage={
          onMessage &&
          ((o) => {
            onClose();
            onMessage(o);
          })
        }
      />
    </PostcardDialog>
  );
};
