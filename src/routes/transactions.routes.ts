import { Router } from 'express';
import multer from 'multer';

import uploadConfig from '../config/upload';

// import { getCustomRepository } from 'typeorm';

// import TransactionsRepository from '../repositories/TransactionsRepository';

import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import GetStatementService from '../services/GetStatementService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const getStatement = new GetStatementService();
  const transactions = await getStatement.execute();

  return response.json(transactions);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransaction = new CreateTransactionService();
  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute({ id });
  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    // TODO
    const importTransactionsService = new ImportTransactionsService();
    const importedTransactions = await importTransactionsService.execute({
      filename: request.file.filename,
    });

    return response.json(importedTransactions);
  },
);

export default transactionsRouter;
