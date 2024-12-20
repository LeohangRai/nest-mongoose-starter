import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, RootFilterQuery } from 'mongoose';
import {
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_PAGE,
  KeywordPaginateAndSortQueryDto,
} from 'src/common/dtos/query.dto';
import { SortDirection } from 'src/common/enums/sort-direction.enum';
import { ValidationErrorMessage } from 'src/common/types/validation-error-message.type';
import { getKeywordFilter } from 'src/common/utils/get-keyword-filter';
import {
  Post,
  PostModelFields,
  PostWithTimestamps,
} from 'src/schemas/post.schema';
import { User } from 'src/schemas/user.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { POST_USER_PROJECTION } from './projections/post-user.projection';
import { POSTS_LIST_PROJECTION } from './projections/posts-list.projection';

@Injectable()
export class PostsService {
  private defaultQueryPage = DEFAULT_QUERY_PAGE;
  private defaultQueryLimit = DEFAULT_QUERY_LIMIT;
  private keywordFilterFields: PostModelFields[] = ['title'];
  private sortableFields: PostModelFields[] = [
    'createdAt',
    'updatedAt',
    'title',
  ];
  private defaultSortField: PostModelFields = 'createdAt';
  private defaultSortDirection = SortDirection.DESCENDING;

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  validateSortByField(sortBy: string) {
    if (!sortBy) return;
    if (!this.sortableFields.includes(sortBy as PostModelFields)) {
      const validationErrorObj: ValidationErrorMessage = {
        property: 'sortBy',
        message: `sortBy must be one of the following values: ${this.sortableFields.join(
          ', ',
        )}`,
      };
      throw new UnprocessableEntityException([validationErrorObj]);
    }
  }

  get(query: KeywordPaginateAndSortQueryDto<PostWithTimestamps>) {
    const {
      keyword,
      page = this.defaultQueryPage,
      limit = this.defaultQueryLimit,
      sortBy = this.defaultSortField,
      sortDirection = this.defaultSortDirection,
    } = query;
    this.validateSortByField(sortBy);
    const skip = (page - 1) * limit;
    let filter: RootFilterQuery<Post> = {};
    const keywordFilter = getKeywordFilter<PostWithTimestamps>(
      keyword,
      this.keywordFilterFields,
    );
    /* only keyword filter at the moment. may have to add other filters like 'userId' and 'status' later */
    filter = {
      ...keywordFilter,
    };
    return this.postModel
      .find(filter, POSTS_LIST_PROJECTION, {
        skip,
        limit,
      })
      .sort({
        [sortBy]: sortDirection,
      })
      .populate('user', POST_USER_PROJECTION);
  }

  getPostById(id: string) {
    return this.postModel.findById(id).populate('user', POST_USER_PROJECTION);
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
      const postWithUser = await newPost.populate('user', POST_USER_PROJECTION);
      await session.commitTransaction();
      return postWithUser;
    } catch (error) {
      await session.abortTransaction();
    } finally {
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
    return updatedPost.populate('user', POST_USER_PROJECTION);
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
