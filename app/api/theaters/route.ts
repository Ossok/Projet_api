// app/api/theaters/route.ts

import { NextResponse } from 'next/server';
import { Db, MongoClient } from 'mongodb';
import clientPromise from '@/lib/mongodb';

/**
 * @swagger
 * /api/theaters:
 *   get:
 *     description: Récupérer la liste de tous les théâtres et cinémas
 *     responses:
 *       200:
 *         description: Liste des théâtres
 *       500:
 *         description: Erreur interne du serveur
 */

export async function GET(): Promise<NextResponse> {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('sample_mflix');
    const theaters = await db.collection('theaters').find({}).limit(10).toArray();

    return NextResponse.json(
      { status: 200, data: theaters }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: 500, message: 'Erreur interne du serveur', error: error.message }
    );
  }
}
