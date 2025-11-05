import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: false,
})
export default class UserModel extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  email!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  first_name?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  last_name?: string;

  @Column({
    type: DataType.STRING(50),
    defaultValue: 'inactive',
    validate: {
      isIn: [['active', 'inactive', 'cancelled', 'expired']],
    },
  })
  subscription_status!: string;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // Associations are defined in models/index.ts
  // These are type hints for TypeScript
  declare subscriptions?: unknown[];
  declare payments?: unknown[];
  declare user_movies?: unknown[];
}

