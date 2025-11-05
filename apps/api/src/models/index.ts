/**
 * Barrel export for all Models and Sequelize instance
 * 
 * Models are auto-loaded by sequelize-typescript from config
 * No manual initialization needed!
 */
import { sequelize } from '../config';
import ItemModel from './item.model';
import UserModel from './user.model';
import SubscriptionModel from './subscription.model';
import PaymentModel from './payment.model';
import MovieModel from './movie.model';
import MovieCategoryModel from './movie_category.model';
import SubtitleModel from './subtitle.model';
import UserMovieModel from './user_movie.model';
import ApiCreditModel from './api_credit.model';
import AdminFundingModel from './admin_funding.model';
import ApiUsageModel from './api_usage.model';

/**
 * Initialize model associations here
 */
export const initializeAssociations = (): void => {
  // User associations
  UserModel.hasMany(SubscriptionModel, { foreignKey: 'user_id', as: 'subscriptions' });
  UserModel.hasMany(PaymentModel, { foreignKey: 'user_id', as: 'payments' });
  UserModel.hasMany(UserMovieModel, { foreignKey: 'user_id', as: 'user_movies' });
  UserModel.hasMany(AdminFundingModel, { foreignKey: 'user_id', as: 'fundings' });
  UserModel.hasOne(AdminFundingModel, { foreignKey: 'created_by', as: 'created_fundings' });

  // Subscription associations
  SubscriptionModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });
  SubscriptionModel.hasMany(PaymentModel, { foreignKey: 'subscription_id', as: 'payments' });

  // Payment associations
  PaymentModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });
  PaymentModel.belongsTo(SubscriptionModel, { foreignKey: 'subscription_id', as: 'subscription' });

  // Movie associations
  MovieModel.hasMany(MovieCategoryModel, { foreignKey: 'movie_id', as: 'categories' });
  MovieModel.hasMany(SubtitleModel, { foreignKey: 'movie_id', as: 'subtitles' });
  MovieModel.hasMany(UserMovieModel, { foreignKey: 'movie_id', as: 'user_movies' });
  MovieModel.hasMany(ApiUsageModel, { foreignKey: 'movie_id', as: 'api_usage' });

  // MovieCategory associations
  MovieCategoryModel.belongsTo(MovieModel, { foreignKey: 'movie_id', as: 'movie' });

  // Subtitle associations
  SubtitleModel.belongsTo(MovieModel, { foreignKey: 'movie_id', as: 'movie' });

  // UserMovie associations
  UserMovieModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });
  UserMovieModel.belongsTo(MovieModel, { foreignKey: 'movie_id', as: 'movie' });

  // AdminFunding associations
  AdminFundingModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });
  AdminFundingModel.belongsTo(UserModel, { foreignKey: 'created_by', as: 'creator' });

  // ApiUsage associations
  ApiUsageModel.belongsTo(MovieModel, { foreignKey: 'movie_id', as: 'movie' });
};

// Export individual models
export { default as ItemModel } from './item.model';
export { default as UserModel } from './user.model';
export { default as SubscriptionModel } from './subscription.model';
export { default as PaymentModel } from './payment.model';
export { default as MovieModel } from './movie.model';
export { default as MovieCategoryModel } from './movie_category.model';
export { default as SubtitleModel } from './subtitle.model';
export { default as UserMovieModel } from './user_movie.model';
export { default as ApiCreditModel } from './api_credit.model';
export { default as AdminFundingModel } from './admin_funding.model';
export { default as ApiUsageModel } from './api_usage.model';

// Export sequelize instance
export { sequelize };

// Export all models object
export const models = {
  Item: ItemModel,
  User: UserModel,
  Subscription: SubscriptionModel,
  Payment: PaymentModel,
  Movie: MovieModel,
  MovieCategory: MovieCategoryModel,
  Subtitle: SubtitleModel,
  UserMovie: UserMovieModel,
  ApiCredit: ApiCreditModel,
  AdminFunding: AdminFundingModel,
  ApiUsage: ApiUsageModel,
};

export default models;
