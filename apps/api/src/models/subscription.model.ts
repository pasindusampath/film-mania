import { Table, Column, Model, DataType, BelongsTo, ForeignKey, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import UserModel from './user.model';

@Table({
  tableName: 'subscriptions',
  timestamps: true,
  underscored: false,
})
export default class SubscriptionModel extends Model {
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

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    unique: true,
  })
  stripe_subscription_id?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: 'inactive',
    validate: {
      isIn: [['active', 'inactive', 'cancelled', 'past_due', 'trialing']],
    },
  })
  status!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['monthly', 'yearly']],
    },
  })
  plan_type!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  start_date?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  end_date?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  current_period_start?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  current_period_end?: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  funded_by_admin!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  cancelled_at?: Date;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // Associations
  @BelongsTo(() => UserModel, 'user_id')
  user!: UserModel;
}

