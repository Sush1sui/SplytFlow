export type CreateOrUpdateBody = {
  userId: string;
  amount: number;
};

export type DeleteBody = { salesIds?: string[]; date?: Date };
