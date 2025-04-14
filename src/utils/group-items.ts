import { ITrackItemsMap, ITransition } from "@designcombo/types";
export interface IGroupedTrackItem {
  id: string;
  isFrom: boolean;
  isTo: boolean;
  transition?: ITransition | null;
  transitionTo?: { id: string } | null;
}

export const groupTrackItems = (data: {
  trackItemIds: string[];
  transitionsMap: Record<string, ITransition>;
  trackItemsMap: ITrackItemsMap;
}): IGroupedTrackItem[] => {
  const { trackItemIds, transitionsMap } = data;

  // Initialize result array with default values
  const result: IGroupedTrackItem[] = trackItemIds.map((id) => ({
    id,
    isFrom: false,
    isTo: false,
    transition: null,
    transitionTo: null,
  }));

  // Create a map for easy lookup of track items by ID
  const trackItemMap = new Map<string, IGroupedTrackItem>();
  result.forEach((item) => trackItemMap.set(item.id, item));

  // Process transitions
  Object.values(transitionsMap).forEach((transition) => {
    const fromItem = trackItemMap.get(transition.fromId);
    const toItem = trackItemMap.get(transition.toId);

    if (fromItem) {
      fromItem.isFrom = true;
      fromItem.transition = transition;
      fromItem.transitionTo = { id: transition.toId };
    }

    if (toItem) {
      toItem.isTo = true;
    }
  });

  return result;
};
