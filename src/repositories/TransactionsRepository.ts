import { EntityRepository, Repository } from 'typeorm';

import Balance from '../models/Balance';
import Transaction from '../models/Transaction';

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    // TODO

    const transactions = await this.find();

    const incomeTotalValue = transactions
      .filter(transaction => transaction.type === 'income')
      .map(incomeTransaction =>
        incomeTransaction ? incomeTransaction.value : 0,
      )
      .reduce((sum, currentValue) => sum + currentValue, 0);

    const outcomeTotalValue = transactions
      .filter(transaction => transaction.type === 'outcome')
      .map(outcomeTransaction =>
        outcomeTransaction ? outcomeTransaction.value : 0,
      )
      .reduce((sum, currentValue) => sum + currentValue, 0);

    const totalValue = incomeTotalValue - outcomeTotalValue;

    return {
      income: incomeTotalValue,
      outcome: outcomeTotalValue,
      total: totalValue,
    };
  }

  public async all(): Promise<Transaction[]> {
    const transactions = await this.find({
      relations: ['category'],
    });

    return transactions;
  }
}

export default TransactionsRepository;
