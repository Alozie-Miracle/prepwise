import { db } from "@/firebase/admin";

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  try {
    const interviewSnapshot = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    if (interviewSnapshot.empty) {
      return null;
    }

    return interviewSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return null;
  }
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  try {
    const { userId, limit = 20 } = params;
    const interviewSnapshot = await db
      .collection("interviews")
      .orderBy("createdAt", "desc")
      .where("finalized", "==", true)
      .limit(limit)
      .where("userId", "!=", userId)
      .get();

    if (interviewSnapshot.empty) {
      return null;
    }

    return interviewSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return null;
  }
}

export async function getInterviewsById(id: string): Promise<Interview | null> {
  try {
    const interviewSnapshot = await db.collection("interviews").doc(id).get();

    return interviewSnapshot.data() as Interview | null;
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return null;
  }
}
