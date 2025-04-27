import { Job, Queue, QueueEvents, Worker } from 'bullmq';
import { Ethers } from './ethers';
import { ethers } from 'ethers';
import { JobDataType } from '@/utils/interface';
import { TransactionRepository } from '@/database/repository/implementation';
import { connection } from './redis';

/**
 * Initiate the Ethers & Transaction Repo Class
 */
const ethersService = new Ethers();
const transactionRepo = new TransactionRepository();

const DEFAULT_NAME = 'transaction';

/**
 * Queue property and method
 */
const queue = new Queue(DEFAULT_NAME);
export async function addJobs(name: string, data: any) {
  return await queue.add(name, data, {
    removeOnComplete: true,
    removeOnFail: true,
    removeDependencyOnFailure: true,
  });
}
/**
 * QueueEvent property and method
 */
export const queueEvent = new QueueEvents(DEFAULT_NAME, { connection });

/**
 * Worker property and method
 */
export const worker = new Worker(
  DEFAULT_NAME,
  async (job: Job<JobDataType, ethers.providers.TransactionResponse>) => {
    const walletAddress = job.data.walletAddress;
    await transactionRepo.create(walletAddress);

    try {
      console.log('👨‍🔧 Inside worker, continue to request token function...');
      const tx = await ethersService.requestToken(walletAddress);
      await transactionRepo.updateSuccess(walletAddress, tx.hash);

      console.log('✅ Sending token success.');
      return tx;
    } catch (error) {
      console.error('🚨 Error due running the worker, error: ', error)
      await transactionRepo.updateFailed(walletAddress);
      throw error;
    }
  },
  {
    connection,
    removeOnComplete: {
      count: 0,
    },
    removeOnFail: { count: 0 },
    concurrency: 1,
    maxStalledCount: 0,
    stalledInterval: 100,
  },
);
