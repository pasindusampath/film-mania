import { Table, Column, Model, DataType, BelongsTo, ForeignKey, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import UserModel from './user.model';
import MovieModel from './movie.model';

@Table({
  tableName: 'user_movies',
  timestamps: true,
  underscored: false,
})
export default class UserMovieModel extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  user_id!: string;

  @ForeignKey(() => MovieModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  movie_id!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  watched_at?: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  favorited!: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  watch_position!: number;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // Associations
  @BelongsTo(() => UserModel, 'user_id')
  user!: UserModel;

  @BelongsTo(() => MovieModel, 'movie_id')
  movie!: MovieModel;
}

