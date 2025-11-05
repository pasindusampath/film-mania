import { Table, Column, Model, DataType, HasMany, HasOne, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';

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
    type: DataType.STRING(255),
    allowNull: false,
  })
  password_hash!: string;

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

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  last_login?: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_admin!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  is_active!: boolean;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // Associations
  @HasMany(() => require('./subscription.model').default, 'user_id')
  subscriptions!: any[];

  @HasMany(() => require('./payment.model').default, 'user_id')
  payments!: any[];

  @HasMany(() => require('./user_movie.model').default, 'user_id')
  user_movies!: any[];
}

