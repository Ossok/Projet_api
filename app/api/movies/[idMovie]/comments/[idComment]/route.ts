// app/api/movies/[idMovie]/comments/[idComment]/route.ts

import { NextRequest, NextResponse } from 'next/server';
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
  request: NextRequest,
  context: { params: { idMovie: string; idComment: string } }
): Promise<NextResponse> {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('sample_mflix');

    const { idMovie, idComment } = context.params;

    // Validate IDs
    if (!ObjectId.isValid(idMovie)) {
      return NextResponse.json({ status: 400, message: 'Invalid movie ID', error: 'Movie ID format is incorrect' }, { status: 400 });
    }

    if (!ObjectId.isValid(idComment)) {
      return NextResponse.json({ status: 400, message: 'Invalid comment ID', error: 'Comment ID format is incorrect' }, { status: 400 });
    }

    // Check if movie exists
    const movie = await db.collection('movies').findOne({ _id: new ObjectId(idMovie) });
    if (!movie) {
      return NextResponse.json({ status: 404, message: 'Movie not found', error: 'No movie found with the given ID' }, { status: 404 });
    }

    // Find the comment for this movie
    const comment = await db.collection('comments').findOne({
      _id: new ObjectId(idComment),
      movie_id: new ObjectId(idMovie),
    });

    if (!comment) {
      return NextResponse.json({ status: 404, message: 'Comment not found', error: 'No comment found with the given ID for this movie' }, { status: 404 });
    }

    return NextResponse.json({ status: 200, data: { comment } });
  } catch (error: any) {
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message }, { status: 500 });
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
  request: NextRequest,
  context: { params: { idMovie: string; idComment: string } }
): Promise<NextResponse> {
  try {
    const { idMovie, idComment } = context.params;

    if (!idMovie || !idComment) {
      return NextResponse.json({ status: 400, message: 'Movie ID and Comment ID are required' }, { status: 400 });
    }

    // Validate MongoDB ObjectId format
    if (!ObjectId.isValid(idMovie) || !ObjectId.isValid(idComment)) {
      return NextResponse.json({ status: 400, message: 'Invalid ID format' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();

    if (!body || (!body.text && !body.user)) {
      return NextResponse.json({ status: 400, message: 'Request body must contain at least text or user field' }, { status: 400 });
    }

    const client: MongoClient = await clientPromise;
    const db: Db = client.db('sample_mflix');

    // Update the comment
    const result = await db.collection('comments').updateOne(
      {
        _id: new ObjectId(idComment),
        movie_id: new ObjectId(idMovie),
      },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ status: 404, message: 'Movie or comment not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: 200,
      message: 'Comment updated successfully',
      data: {
        modified: result.modifiedCount > 0,
        idMovie,
        idComment,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ status: 500, message: 'Internal server error', error: error.message }, { status: 500 });
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
  request: NextRequest,
  context: { params: { idMovie: string; idComment: string } }
): Promise<NextResponse> {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('sample_mflix');
    const { idMovie, idComment } = context.params;

    // Validate ObjectIds
    if (!ObjectId.isValid(idMovie)) {
      return NextResponse.json({ status: 400, message: 'Invalid movie ID', error: 'Movie ID format is incorrect' }, { status: 400 });
    }

    if (!ObjectId.isValid(idComment)) {
      return NextResponse.json({ status: 400, message: 'Invalid comment ID', error: 'Comment ID format is incorrect' }, { status: 400 });
    }

    // Verify the movie exists
    const movie = await db.collection('movies').findOne({
      _id: new ObjectId(idMovie),
    });

    if (!movie) {
      return NextResponse.json({ status: 404, message: 'Movie not found', error: 'No movie found with the given ID' }, { status: 404 });
    }

    // Delete the comment
    const result = await db.collection('comments').deleteOne({
      _id: new ObjectId(idComment),
      movie_id: new ObjectId(idMovie),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ status: 404, message: 'Comment not found', error: 'No comment found with the given ID for this movie' }, { status: 404 });
    }

    return NextResponse.json({ status: 200, message: 'Comment deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/movies/{idMovie}/comments/{idComment}:
 *   put:
 *     summary: Update a comment by ID for a specific movie
 *     description: Update the text of a specific comment in a movie's comments array, identified by the movie's MongoDB ObjectId and the comment's ObjectId.
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
 *                 description: Updated text of the comment
 *             required:
 *               - text
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Invalid movie ID, comment ID, or missing text
 *       404:
 *         description: Movie or comment not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(
  request: NextRequest,
  context: { params: { idMovie: string; idComment: string } }
): Promise<NextResponse> {
  try {
    const client: MongoClient = await clientPromise;
    const db: Db = client.db('sample_mflix');
    const { idMovie, idComment } = context.params;
    const body = await request.json();

    // Validate movie and comment IDs
    if (!ObjectId.isValid(idMovie)) {
      return NextResponse.json({ status: 400, message: 'Invalid movie ID', error: 'Movie ID format is incorrect' }, { status: 400 });
    }
    if (!ObjectId.isValid(idComment)) {
      return NextResponse.json({ status: 400, message: 'Invalid comment ID', error: 'Comment ID format is incorrect' }, { status: 400 });
    }

    // Validate request body
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json({ status: 400, message: 'Invalid input', error: 'Comment text is required and must be a string' }, { status: 400 });
    }

    // Update the specific comment in the movie's comments array
    const result = await db.collection('movies').updateOne(
      { _id: new ObjectId(idMovie), 'comments._id': new ObjectId(idComment) },
      {
        $set: {
          'comments.$.text': body.text,
          'comments.$.updatedAt': new Date(),
        },
      }
    );

    // Check if the movie or comment was found
    if (result.matchedCount === 0) {
      return NextResponse.json({ status: 404, message: 'Movie or comment not found', error: 'No matching movie or comment with the given IDs' }, { status: 404 });
    }

    return NextResponse.json({ status: 200, message: 'Comment updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}