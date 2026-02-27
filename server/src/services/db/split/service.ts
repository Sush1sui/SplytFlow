import dbClient from "../../../db/dbClient";

export async function create(userId: string, name: string, value: number) {
  try {
    const split = await dbClient.split.create({
      data: {
        userId,
        name,
        value,
      },
    });
    return split;
  } catch (error) {
    console.error("Error creating split:", error);
    throw error;
  }
}

export async function update(userId: string, name: string, value: number) {
  try {
    const split = await dbClient.split.update({
      where: {
        userId_name: {
          userId,
          name,
        },
      },
      data: {
        value,
      },
    });
    return split;
  } catch (error) {
    console.error("Error updating split:", error);
    throw error;
  }
}

export async function getSplitsByUserId(userId: string) {
  try {
    const splits = await dbClient.split.findMany({
      where: {
        userId,
      },
    });
    return splits;
  } catch (error) {
    console.error("Error getting splits by userId:", error);
    throw error;
  }
}

export async function deleteSplitByName(userId: string, name: string) {
  try {
    const deletedSplit = await dbClient.split.delete({
      where: {
        userId_name: {
          userId,
          name,
        },
      },
    });
    return deletedSplit;
  } catch (error) {
    console.error("Error deleting split by name:", error);
    throw error;
  }
}

export async function deleteAllSplitsByUserId(userId: string) {
  try {
    const deletedSplits = await dbClient.split.deleteMany({
      where: {
        userId,
      },
    });
    return deletedSplits.count;
  } catch (error) {
    console.error("Error deleting splits by userId:", error);
    throw error;
  }
}
