import { Table, Column, Model, DataType, BelongsTo, ForeignKey, CreatedAt } from 'sequelize-typescript';
import MovieModel from './movie.model';

@Table({
  tableName: 'api_usage',
  timestamps: false,
  underscored: false,
})
export default class ApiUsageModel extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  api_provider!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  endpoint?: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
  })
  credits_used!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  request_type?: string;

  @ForeignKey(() => MovieModel)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  movie_id?: string;

  @CreatedAt
  created_at!: Date;

  // Associations
  @BelongsTo(() => MovieModel, 'movie_id')
  movie?: MovieModel;
}

