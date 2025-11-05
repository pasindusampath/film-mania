import { Table, Column, Model, DataType, BelongsTo, ForeignKey, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import UserModel from './user.model';
import SubscriptionModel from './subscription.model';

@Table({
  tableName: 'payments',
  timestamps: true,
  underscored: false,
})
export default class PaymentModel extends Model {
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

  @ForeignKey(() => SubscriptionModel)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  subscription_id?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    unique: true,
  })
  stripe_payment_id?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  stripe_payment_intent_id?: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.STRING(10),
    defaultValue: 'USD',
  })
  currency!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['pending', 'succeeded', 'failed', 'refunded']],
    },
  })
  status!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  payment_method?: string;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // Associations
  @BelongsTo(() => UserModel, 'user_id')
  user!: UserModel;

  @BelongsTo(() => SubscriptionModel, 'subscription_id')
  subscription?: SubscriptionModel;
}

