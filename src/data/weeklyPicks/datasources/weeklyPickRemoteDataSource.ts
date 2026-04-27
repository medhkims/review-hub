import { collection, query, where, orderBy, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { firestore } from '@/core/firebase/firebaseConfig';
import { WeeklyPickModel } from '../models/weeklyPickModel';

export interface WeeklyPickRemoteDataSource {
  getWeeklyPicks(): Promise<WeeklyPickModel[]>;
  getAllWeeklyPicks(): Promise<WeeklyPickModel[]>;
  createWeeklyPick(data: Omit<WeeklyPickModel, 'id'>): Promise<string>;
  deleteWeeklyPick(id: string): Promise<void>;
}

export class WeeklyPickRemoteDataSourceImpl implements WeeklyPickRemoteDataSource {
  async getWeeklyPicks(): Promise<WeeklyPickModel[]> {
    // Get picks from the current week (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const q = query(
      collection(firestore, 'weeklyPicks'),
      where('week_start_date', '>=', Timestamp.fromDate(sevenDaysAgo)),
      orderBy('week_start_date', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as WeeklyPickModel[];
  }

  async getAllWeeklyPicks(): Promise<WeeklyPickModel[]> {
    const q = query(
      collection(firestore, 'weeklyPicks'),
      orderBy('created_at', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as WeeklyPickModel[];
  }

  async createWeeklyPick(data: Omit<WeeklyPickModel, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(firestore, 'weeklyPicks'), data);
    return docRef.id;
  }

  async deleteWeeklyPick(id: string): Promise<void> {
    await deleteDoc(doc(firestore, 'weeklyPicks', id));
  }
}
