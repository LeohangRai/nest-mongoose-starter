import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Post } from 'src/schemas/post.schema';
import { User } from 'src/schemas/user.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  get() {
    return this.postModel.find().populate('user');
  }

  getPostById(id: string) {
    return this.postModel.findById(id).populate('user');
  }

  async create({ userId, ...postData }: CreatePostDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException({
        message: 'There are no users with the provided ID',
      });
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const postInstance = new this.postModel({
        ...postData,
        user: user._id,
      });
      const newPost = await postInstance.save({ session });
      await user.updateOne(
        {
          $push: {
            posts: newPost._id,
          },
        },
        {
          session,
        },
      );
      const postWithUser = await newPost.populate('user');
      await session.commitTransaction();
      await session.endSession();
      return postWithUser;
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
    }
  }

  // TODO: Take userId to check if the post belongs to the current user (just find the post by the post ID and the provided user ID and throw 404 if not found)
  async update(id: string, data: UpdatePostDto) {
    const post = await this.postModel.findOne({
      _id: id,
    });
    if (!post) {
      throw new NotFoundException({
        message: 'There are no posts with the provided ID',
      });
    }
    const updatedPost = await this.postModel.findByIdAndUpdate(post._id, data);
    return updatedPost.populate('user');
  }

  // TODO: Take userId to check if the post belongs to the current user (just find the post by the post ID and the provided user ID and throw 404 if not found)
  async delete(id: string) {
    const post = await this.postModel.findOne({
      _id: id,
    });
    if (!post) {
      throw new NotFoundException({
        message: 'There are no posts with the provided ID',
      });
    }
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await this.postModel
        .deleteOne({
          _id: id,
        })
        .session(session);
      await this.userModel
        .updateOne(
          {
            _id: post.user,
          },
          {
            $pull: {
              posts: id,
            },
          },
        )
        .session(session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
