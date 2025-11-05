import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import UserModel from './user.model';

@Table({
  tableName: 'auth',
  timestamps: true,
  underscored: false,
})
export default class AuthModel extends Model {
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
    unique: true,
  })
  user_id!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  password_hash!: string;

  @Column({
    type: DataType.STRING(20),
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'admin']],
    },
  })
  role!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  is_active!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  last_login?: Date;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // Associations
  @BelongsTo(() => UserModel, 'user_id')
  user!: UserModel;
}

