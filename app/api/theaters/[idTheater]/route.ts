// page/api/theaters/[idTheater]/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient, ObjectId } from 'mongodb';
/**
 * @swagger
 * /api/theaters/{idTheater}:
 *   get:
 *     summary: Get a theater by ID
 *     description: Retrieve a single theater document by its MongoDB ObjectId.
 *     parameters:
 *       - in: path
 *         name: idTheater
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the Theater
 *     responses:
 *       200:
 *         description: Theater found
 *       400:
 *         description: Invalid theater ID
 *       404:
 *         description: Theater not found
 *       500:
 *         description: Internal server error
 */
export async function GET(request: Request, { params }: { params: any }): Promise<NextResponse> {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('sample_mflix');
    
    const { idTheater } = params;
    if (!ObjectId.isValid(idTheater)) {
      return NextResponse.json({ status: 400, message: 'Invalid Theaters ID', error: 'ID format is incorrect' });
    }
    
    const theater = await db.collection('theaters').findOne({ _id: new ObjectId(idTheater) });
    
    if (!theater) {
      return NextResponse.json({ status: 404, message: 'Theater not found', error: 'No Theater found with the given ID' });
    }
    
    return NextResponse.json({ status: 200, data: { theater } });
  } catch (error: any) {
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
  }
}
