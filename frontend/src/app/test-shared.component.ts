import { Component } from '@angular/core';
import { IFile } from '@interfaces/file.interface';
import { FileModel } from '@models/file.model';
import { FileStatus } from '@enums/file-status.enum';

@Component({
  selector: 'app-test-shared',
  template: `
    <div class="test-container">
      <h2>✅ Тест импорта из shared/</h2>

      @if (testFile) {
        <div>
          <h3>Интерфейс IFile:</h3>
          <ul>
            <li><strong>ID:</strong> {{testFile.id}}</li>
            <li><strong>Имя файла:</strong> {{testFile.fileName}}</li>
            <li><strong>Оригинальное имя:</strong> {{testFile.originalName}}</li>
            <li><strong>Размер:</strong> {{testFile.fileSize}} байт</li>
            <li><strong>MIME тип:</strong> {{testFile.mimeType}}</li>
            <li><strong>Путь:</strong> {{testFile.storagePath}}</li>
          </ul>
        </div>
      }

      @if (fileModel) {
        <div>
          <h3>Модель FileModel:</h3>
          <ul>
            <li><strong>ID:</strong> {{fileModel.id}}</li>
            <li><strong>Имя файла:</strong> {{fileModel.fileName}}</li>
            <li><strong>URL:</strong> {{fileModel.url || 'не задан'}}</li>
            <li><strong>Прогресс:</strong> {{uiProgress}}%</li>
            <li><strong>Статус:</strong> {{uiStatus}}</li>
          </ul>
        </div>
      }

      <button (click)="createTestData()">Создать тестовые данные</button>
      <button (click)="clearData()" style="margin-left: 10px; background: #f44336;">Очистить</button>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 20px;
      border: 2px solid #4CAF50;
      border-radius: 8px;
      margin: 20px;
      background: #f9f9f9;
      font-family: Arial, sans-serif;
    }
    h2 {
      color: #4CAF50;
      margin-top: 0;
    }
    h3 {
      color: #2196F3;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      margin: 8px 0;
      padding: 12px;
      background: white;
      border-radius: 4px;
      border-left: 4px solid #4CAF50;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    strong {
      color: #333;
      min-width: 150px;
      display: inline-block;
    }
    button {
      padding: 10px 20px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 15px;
      font-size: 14px;
      transition: background 0.3s;
    }
    button:hover {
      background: #45a049;
    }
    button:last-child:hover {
      background: #d32f2f;
    }
  `]
})
export class TestSharedComponent {
  testFile: IFile | null = null;
  fileModel: FileModel | null = null;

  uiProgress = 0;
  uiStatus = FileStatus.PENDING;

  createTestData() {
    // Тестовые данные для интерфейса IFile
    this.testFile = {
      id: 'test-' + Date.now(),
      fileName: 'document_processed.pdf',
      originalName: 'document.pdf',
      fileSize: 204800,
      mimeType: 'application/pdf',
      storagePath: '/uploads/' + Date.now() + '_document.pdf',
      createdAt: new Date(),
      userId: 'user-test-123'
    };

    // Тестовые данные для модели фронтенда
    this.fileModel = new FileModel();
    this.fileModel.id = this.testFile.id;
    this.fileModel.fileName = this.testFile.fileName;
    this.fileModel.originalName = this.testFile.originalName;
    this.fileModel.fileSize = this.testFile.fileSize;
    this.fileModel.mimeType = this.testFile.mimeType;
    this.fileModel.storagePath = this.testFile.storagePath;
    this.fileModel.url = 'https://firebasestorage.googleapis.com/example.pdf';

    // UI-специфичные данные
    this.uiProgress = 75;
    this.uiStatus = FileStatus.PROCESSING;

    console.log('✅ Тестовые данные созданы:');
    console.log('IFile:', this.testFile);
    console.log('FileModel:', this.fileModel);
    console.log('UI Прогресс:', this.uiProgress + '%');
    console.log('UI Статус:', this.uiStatus);
  }

  clearData() {
    this.testFile = null;
    this.fileModel = null;
    this.uiProgress = 0;
    this.uiStatus = FileStatus.PENDING;
    console.log('🔄 Данные очищены');
  }
}
