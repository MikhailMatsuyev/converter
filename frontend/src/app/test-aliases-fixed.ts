// Тест алиасов с правильными путями
import { IFile } from '@interfaces/file.interface';
import { FileModel } from '@models/file.model';
import { FileStatus } from '@enums/file-status.enum';

console.log('✅ лиасы работают:');

// спользуем типы
const file: IFile = {
  id: 'test',
  fileName: 'test.txt',
  originalName: 'test.txt',
  fileSize: 100,
  mimeType: 'text/plain',
  storagePath: '/test',
  createdAt: new Date(),
  userId: 'user-123'
};

console.log('IFile создан:', file);

const model = new FileModel();
console.log('FileModel создан:', model);
console.log('FileStatus.PROCESSING:', FileStatus.PROCESSING);