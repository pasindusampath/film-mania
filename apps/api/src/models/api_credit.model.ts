import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({
  tableName: 'api_credits',
  timestamps: true,
  underscored: false,
})
export default class ApiCreditModel extends Model {
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
    type: DataType.INTEGER,
    allowNull: false,
  })
  credits_purchased!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  credits_used!: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  purchase_date?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiry_date?: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  cost?: number;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;
}

