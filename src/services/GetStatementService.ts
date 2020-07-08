import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Balance from '../models/Balance';

interface Statement {
  transactions: Transaction[];
  balance: Balance;
}

class GetStatementService {
  public async execute(): Promise<Statement> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const balance = await transactionsRepository.getBalance();
    const transactions = await transactionsRepository.find();

    return { transactions, balance };
  }
}

export default GetStatementService;
