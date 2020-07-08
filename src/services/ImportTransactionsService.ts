import { getRepository, getCustomRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  filename: string;
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    // TODO

    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', filename);

    async function loadCSV(filePath: string): Promise<any[]> {
      const readCSVStream = fs.createReadStream(filePath);

      const parseStream = csvParse({
        columns: true,
        ltrim: true,
        rtrim: true,
      });

      const parseCSV = readCSVStream.pipe(parseStream);

      const lines: string[] = [];
      parseCSV.on('data', line => {
        lines.push(line);
      });

      await new Promise(resolve => {
        parseCSV.on('end', resolve);
      });

      return lines;
    }

    const csvTransactions: CSVTransaction[] = [];
    const csvCategories: string[] = [];
    const csvData = await loadCSV(csvFilePath);
    csvData.forEach(element => {
      const { title, type, value, category } = element;

      const transaction = {
        title,
        type,
        value,
        category,
      };

      csvCategories.push(category);
      csvTransactions.push(transaction);
    });

    const categoriesRepository = getRepository(Category);

    const existentCategories = await categoriesRepository.find({
      where: In(csvCategories),
    });

    const existentCategoriesTitles = existentCategories.map(
      existentCategory => existentCategory.title,
    );

    const filteredCategoriesTitles = csvCategories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((category, index, self) => self.indexOf(category) === index);

    const addedCategories = categoriesRepository.create(
      filteredCategoriesTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(addedCategories);

    const allCategories = [...existentCategories, ...addedCategories];

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactions = transactionsRepository.create(
      csvTransactions.map(transaction => ({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category: allCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(transactions);

    await fs.promises.unlink(csvFilePath);

    return transactions;
  }
}

export default ImportTransactionsService;
