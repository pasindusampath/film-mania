import { Table, Column, Model, DataType, BelongsTo, ForeignKey, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import UserModel from './user.model';

@Table({
  tableName: 'admin_funding',
  timestamps: true,
  underscored: false,
})
export default class AdminFundingModel extends Model {
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
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 3,
  })
  months_funded!: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  start_date?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  end_date!: Date;

  @Column({
    type: DataType.STRING(50),
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'expired', 'cancelled']],
    },
  })
  status!: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  created_by?: string;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // Associations
  @BelongsTo(() => UserModel, 'user_id')
  user!: UserModel;

  @BelongsTo(() => UserModel, 'created_by')
  creator?: UserModel;
}

