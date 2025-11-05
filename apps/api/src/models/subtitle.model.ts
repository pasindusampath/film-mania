import { Table, Column, Model, DataType, BelongsTo, ForeignKey, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import MovieModel from './movie.model';

@Table({
  tableName: 'subtitles',
  timestamps: true,
  underscored: false,
})
export default class SubtitleModel extends Model {
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
    type: DataType.STRING(10),
    allowNull: false,
    validate: {
      isIn: [['en', 'si']],
    },
  })
  language!: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  subtitle_file_path?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  srt_content?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  translated_by_ai!: boolean;

  @Column({
    type: DataType.STRING(50),
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'processing', 'completed', 'failed']],
    },
  })
  translation_status!: string;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // Associations
  @BelongsTo(() => MovieModel, 'movie_id')
  movie!: MovieModel;
}

