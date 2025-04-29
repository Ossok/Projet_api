// page/api/movies/[idMovie]/comments/[idComment]/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Db, MongoClient, ObjectId } from 'mongodb';

/**
 * @swagger
 * /api/movies/{idMovie}/comments/{idComment}:
 *   get:
 *     summary: Get a specific comment for a movie
 *     description: Retrieve a single comment by its ID for a specific movie
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the movie
 *       - in: path
 *         name: idComment
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the comment
 *     responses:
 *       200:
 *         description: Comment found
 *       400:
 *         description: Invalid movie ID or comment ID
 *       404:
 *         description: Movie or comment not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  request: Request, 
  { params }: { params: any }
): Promise<NextResponse> {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('sample_mflix');
    
    const { idMovie, idComment } = params;
    
    // Validate IDs
    if (!ObjectId.isValid(idMovie)) {
      return NextResponse.json({ status: 400, message: 'Invalid movie ID', error: 'Movie ID format is incorrect' });
    }
    
    if (!ObjectId.isValid(idComment)) {
      return NextResponse.json({ status: 400, message: 'Invalid comment ID', error: 'Comment ID format is incorrect' });
    }
    
    // Check if movie exists
    const movie = await db.collection('movies').findOne({ _id: new ObjectId(idMovie) });
    if (!movie) {
      return NextResponse.json({ status: 404, message: 'Movie not found', error: 'No movie found with the given ID' });
    }
    
    // Find the comment for this movie
    const comment = await db.collection('comments').findOne({ 
      _id: new ObjectId(idComment),
      movie_id: new ObjectId(idMovie)
    });
    
    if (!comment) {
      return NextResponse.json({ status: 404, message: 'Comment not found', error: 'No comment found with the given ID for this movie' });
    }
    
    return NextResponse.json({ status: 200, data: { comment } });
  } catch (error: any) {
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
  }
}

/**
 * @swagger
 * /api/movies/{idMovie}/comments/{idComment}:
 *   post:
 *     summary: Update a specific comment for a movie
 *     description: Update a comment by its ID for a specific movie.
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the movie
 *       - in: path
 *         name: idComment
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               user:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Invalid ID format or request body
 *       404:
 *         description: Movie or comment not found
 *       500:
 *         description: Internal server error
 */
export async function POST(
  request: Request,
  { params }: { params: any }
): Promise<NextResponse> {
  try {
    const { idMovie, idComment } = params;
    
    if (!idMovie || !idComment) {
      return NextResponse.json({ 
        status: 400, 
        message: 'Movie ID and Comment ID are required' 
      });
    }
    
    // Validate MongoDB ObjectId format
    if (!ObjectId.isValid(idMovie) || !ObjectId.isValid(idComment)) {
      return NextResponse.json({ 
        status: 400, 
        message: 'Invalid ID format' 
      });
    }

    // Parse request body
    const body = await request.json();
    
    if (!body || (!body.text && !body.user)) {
      return NextResponse.json({ 
        status: 400, 
        message: 'Request body must contain at least text or user field' 
      });
    }

    const client: MongoClient = await clientPromise;
    const db: Db = client.db('sample_mflix');
    
    // Update the comment
    const result = await db.collection('comments').updateOne(
      { 
        _id: new ObjectId(idComment),
        movie_id: new ObjectId(idMovie)
      },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        status: 404, 
        message: 'Movie or comment not found' 
      });
    }

    return NextResponse.json({ 
      status: 200, 
      message: 'Comment updated successfully', 
      data: { 
        modified: result.modifiedCount > 0,
        idMovie,
        idComment
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 500, 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}


/**
 * @swagger
 * /api/movies/{idMovie}/comments/{idComment}:
 *   delete:
 *     summary: Delete a comment from a specific movie
 *     description: Delete a single comment from a movie by its MongoDB ObjectId.
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the movie
 *       - in: path
 *         name: idComment
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the comment
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       400:
 *         description: Invalid movie ID or comment ID
 *       404:
 *         description: Movie or comment not found
 *       500:
 *         description: Internal server error
 */
export async function DELETE(
  request: Request,
  { params }: { params: any }
): Promise<NextResponse> {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('sample_mflix');
    const { idMovie, idComment } = params;

    // Validate ObjectIds
    if (!ObjectId.isValid(idMovie)) {
      return NextResponse.json({ 
        status: 400, 
        message: 'Invalid movie ID', 
        error: 'Movie ID format is incorrect' 
      });
    }
    
    if (!ObjectId.isValid(idComment)) {
      return NextResponse.json({ 
        status: 400, 
        message: 'Invalid comment ID', 
        error: 'Comment ID format is incorrect' 
      });
    }

    // Verify the movie exists
    const movie = await db.collection('movies').findOne({ 
      _id: new ObjectId(idMovie) 
    });

    if (!movie) {
      return NextResponse.json({ 
        status: 404, 
        message: 'Movie not found', 
        error: 'No movie found with the given ID' 
      });
    }

    // Delete the comment
    const result = await db.collection('comments').deleteOne({ 
      _id: new ObjectId(idComment),
      movie_id: new ObjectId(idMovie)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        status: 404, 
        message: 'Comment not found', 
        error: 'No comment found with the given ID for this movie' 
      });
    }

    return NextResponse.json({ 
      status: 200, 
      message: 'Comment deleted successfully' 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 500, 
      message: 'Internal Server Error', 
      error: error.message 
    });
  }
}

/**
 * @swagger
 * /api/movies/{idMovie}/comments/{idComment}:
 *   put:
 *     summary: Update a specific comment for a movie
 *     description: Update a comment by its ID for a specific movie.
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the movie
 *       - in: path
 *         name: idComment
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               user:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Invalid ID format or request body
 *       404:
 *         description: Movie or comment not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(
  request: Request,
  { params }: { params: any }
): Promise<NextResponse> {
  try {
    const { idMovie, idComment } = params;

    if (!idMovie || !idComment) {
      return NextResponse.json({
        status: 400,
        message: 'Movie ID and Comment ID are required'
      });
    }

    if (!ObjectId.isValid(idMovie) || !ObjectId.isValid(idComment)) {
      return NextResponse.json({
        status: 400,
        message: 'Invalid ID format'
      });
    }

    const body = await request.json();

    if (!body || (!body.text && !body.user)) {
      return NextResponse.json({
        status: 400,
        message: 'Request body must contain at least text or user field'
      });
    }

    const client: MongoClient = await clientPromise;
    const db: Db = client.db('sample_mflix');

    const result = await db.collection('comments').updateOne(
      {
        _id: new ObjectId(idComment),
        movie_id: new ObjectId(idMovie)
      },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({
        status: 404,
        message: 'Movie or comment not found'
      });
    }

    return NextResponse.json({
      status: 200,
      message: 'Comment updated successfully',
      data: {
        modified: result.modifiedCount > 0,
        idMovie,
        idComment
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: 'Internal server error',
      error: error.message
    });
  }
}
