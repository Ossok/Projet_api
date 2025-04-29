// page/api/movies/[idMovie]/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient, ObjectId } from 'mongodb';
/**
 * @swagger
 * /api/movies/{idMovie}:
 *   get:
 *     summary: Get a movie by ID
 *     description: Retrieve a single movie document by its MongoDB ObjectId.
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the movie
 *     responses:
 *       200:
 *         description: Movie found
 *       400:
 *         description: Invalid movie ID
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */

export async function GET(request: Request, { params }: { params: { params: any } }): Promise<NextResponse> {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('sample_mflix');
    
    const { idMovie } = params;
    if (!ObjectId.isValid(idMovie)) {
      return NextResponse.json({ status: 400, message: 'Invalid movie ID', error: 'ID format is incorrect' });
    }
    
    const movie = await db.collection('movies').findOne({ _id: new ObjectId(idMovie) });
    
    if (!movie) {
      return NextResponse.json({ status: 404, message: 'Movie not found', error: 'No movie found with the given ID' });
    }
    
    return NextResponse.json({ status: 200, data: { movie } });
  } catch (error: any) {
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
  }
}

/**
 * @swagger
 * /api/movies/{idMovie}:
 *   post:
 *     summary: Get a movie by ID
 *     description: Retrieve a single movie document by its MongoDB ObjectId.
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the movie
 *     responses:
 *       200:
 *         description: Movie found
 *       400:
 *         description: Invalid movie ID
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */

export async function POST(): Promise<NextResponse> {
    try {
      const client: MongoClient = await clientPromise;
      const db: Db = client.db('sample_mflix');

      const movie = {
        title: "The AI Invasion",
        year: 2025,
        director: "Jane Doe",
        genre: ["Sci-Fi", "Thriller"],
        plot: "An advanced AI takes over the world, any only a band of hackers can stop it.",
      };

      const result = await db.collection('movies').insertOne(movie);

      return NextResponse.json({ status: 201, message: 'Movie created successfully', data: { insertedId: result.insertedId}});
    } catch (error: any) {
      return NextResponse.json({ status: 405, message: 'Method Not Allowed', error: 'PUT method is not supported' });
    }
  }

/**
 * @swagger
 * /api/movies/{idMovie}:
 *   put:
 *     summary: Get a movie by ID
 *     description: Retrieve a single movie document by its MongoDB ObjectId.
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the movie
 *     responses:
 *       200:
 *         description: Movie found
 *       400:
 *         description: Invalid movie ID
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */

export async function PUT(request: Request, { params }: { params: { params: any } }): Promise<NextResponse> {
    try {
      const client: MongoClient = await clientPromise;
      const db: Db = client.db('sample_mflix');
      const { idMovie } = params;
  
      if (!ObjectId.isValid(idMovie)) {
        return NextResponse.json({ status: 400, message: 'Invalid movie ID', error: 'ID format is incorrect' });
      }
  
      const movie = {
        title: "The AI Uprising",
        year: 2026,
        director: "John Smith",
        genre: ["Action", "Sci-Fi"],
        plot: "A sequel where the AI returns with a vengeance.",
      };
  
      const result = await db.collection('movies').updateOne(
        { _id: new ObjectId(idMovie) },
        { $set: movie }
      );
  
      if (result.matchedCount === 0) {
        return NextResponse.json({ status: 404, message: 'Movie not found', error: 'No movie to update with the given ID' });
      }
  
      return NextResponse.json({ status: 200, message: 'Movie updated successfully' });
    } catch (error: any) {
      return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
    }
  }

/**
 * @swagger
 * /api/movies/{idMovie}:
 *   delete:
 *     summary: Get a movie by ID
 *     description: Retrieve a single movie document by its MongoDB ObjectId.
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the movie
 *     responses:
 *       200:
 *         description: Movie found
 *       400:
 *         description: Invalid movie ID
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal server error
 */

export async function DELETE(request: Request, { params }: { params: { params: any } }): Promise<NextResponse> {
    try {
      const client: MongoClient = await clientPromise;
      const db: Db = client.db('sample_mflix');
      const { idMovie } = params;
  
      if (!ObjectId.isValid(idMovie)) {
        return NextResponse.json({ status: 400, message: 'Invalid movie ID', error: 'ID format is incorrect' });
      }
  
      const result = await db.collection('movies').deleteOne({ _id: new ObjectId(idMovie) });
  
      if (result.deletedCount === 0) {
        return NextResponse.json({ status: 404, message: 'Movie not found', error: 'No movie to delete with the given ID' });
      }
  
      return NextResponse.json({ status: 200, message: 'Movie deleted successfully' });
    } catch (error: any) {
      return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
    }
  }
  
