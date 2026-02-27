import dbClient from "../../../db/dbClient";

export async function createOrUpdate(userId: string, amount: number) {
  try {
    // get date now
    const now = new Date();

    const sale = await dbClient.sale.upsert({
      where: {
        userId_createdAt: {
          userId,
          createdAt: now,
        },
      },
      update: {
        amount: {
          increment: amount,
        },
      },
      create: {
        userId,
        amount,
        createdAt: now,
      },
    });
    return sale;
  } catch (error) {
    console.error("Error creating sale:", error);
    throw error;
  }
}

export async function getSaleToday(userId: string) {
  try {
    const now = new Date();

    const sale = await dbClient.sale.findFirst({
      where: {
        userId,
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
      },
    });
    return sale;
  } catch (error) {
    console.error("Error getting sale today:", error);
    throw error;
  }
}

export async function getSalesByTimeRange(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  try {
    const sales = await dbClient.sale.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
    return sales;
  } catch (error) {
    console.error("Error getting sales by time range:", error);
    throw error;
  }
}

export async function getTotalSalesByTimeRange(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  try {
    const totalSales = await dbClient.sale.aggregate({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });
    return totalSales._sum.amount || 0;
  } catch (error) {
    console.error("Error getting total sales by time range:", error);
    throw error;
  }
}

export async function deleteSaleByDate(userId: string, date: Date) {
  try {
    const deletedSale = await dbClient.sale.delete({
      where: {
        userId_createdAt: {
          userId,
          createdAt: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
          ),
        },
      },
    });
    return deletedSale;
  } catch (error) {
    console.error("Error deleting sale by date:", error);
    throw error;
  }
}

export async function deleteSalesById(userId: string, saleIds: string[]) {
  try {
    const deletedSales = await dbClient.sale.deleteMany({
      where: {
        userId,
        id: {
          in: saleIds,
        },
      },
    });
    return deletedSales;
  } catch (error) {
    console.error("Error deleting sales by id:", error);
    throw error;
  }
}
