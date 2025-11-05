import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({
  tableName: 'movies',
  timestamps: true,
  underscored: false,
})
export default class MovieModel extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    unique: true,
  })
  tmdb_id?: number;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  overview?: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  poster_path?: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  backdrop_path?: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  release_date?: Date;

  @Column({
    type: DataType.STRING(10),
    allowNull: true,
  })
  language?: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: true,
  })
  original_language?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  region?: string;

  @Column({
    type: DataType.STRING(50),
    defaultValue: 'movie',
    validate: {
      isIn: [['movie', 'anime', 'tv']],
    },
  })
  content_type!: string;

  @Column({
    type: DataType.JSONB,
    defaultValue: [],
  })
  streaming_links!: unknown[];

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  runtime?: number;

  @Column({
    type: DataType.DECIMAL(3, 1),
    allowNull: true,
  })
  vote_average?: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  vote_count!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  popularity?: number;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // Associations are defined in models/index.ts
  // These are type hints for TypeScript
  declare categories?: unknown[];
  declare subtitles?: unknown[];
}

