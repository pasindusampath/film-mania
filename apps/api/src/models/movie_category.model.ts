import { Table, Column, Model, DataType, BelongsTo, ForeignKey, CreatedAt } from 'sequelize-typescript';
import MovieModel from './movie.model';

@Table({
  tableName: 'movie_categories',
  timestamps: false,
  underscored: false,
})
export default class MovieCategoryModel extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => MovieModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  movie_id!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['Tamil', 'Malayalam', 'Hindi', 'English', 'Korean', 'Japanese', 'Anime']],
    },
  })
  category!: string;

  @CreatedAt
  created_at!: Date;

  // Associations
  @BelongsTo(() => MovieModel, 'movie_id')
  movie!: MovieModel;
}

