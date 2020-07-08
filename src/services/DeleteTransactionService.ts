import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    // TODO
    const transaction = getCustomRepository(TransactionsRepository);
    const resp = await transaction.delete(id);
    if (!resp.affected) {
      throw new AppError('Transaction not found.');
    }
  }
}

export default DeleteTransactionService;
