import OpenAIService from '../services/openai-service';
import { CompanyData } from '../services/openai-service';
import { config } from '../config';

export interface FormFields {
  jobTitle: HTMLInputElement | null;
  workplaceName: HTMLInputElement | null;
  phoneNumber: HTMLInputElement | null;
  postalCode: HTMLInputElement | null;
  prefecture: HTMLSelectElement | null;
  city: HTMLInputElement | null;
  address: HTMLInputElement | null;
  buildingName: HTMLInputElement | null;
  nearestStation: HTMLInputElement | null;
  accessType: NodeListOf<HTMLInputElement>;
}

class FormFiller {
  private formFields: FormFields;

  constructor() {
    this.formFields = {
      jobTitle: this.findInputByLabel('求人タイトル'),
      workplaceName: this.findInputByLabel('勤務先名称'),
      phoneNumber: this.findInputByLabel('勤務先電話番号'),
      postalCode: this.findInputByLabel('郵便番号'),
      prefecture: this.findSelectByLabel('都道府県'),
      city: this.findInputByLabel('市区町村'),
      address: this.findInputByLabel('丁目番地'),
      buildingName: this.findInputByLabel('建物名'),
      nearestStation: this.findInputByLabel('駅'),
      accessType: this.findRadioButtonsByLabel('アクセス種別')
    };
  }

  private findInputByLabel(labelText: string): HTMLInputElement | null {
    const label = Array.from(document.querySelectorAll('label')).find(
      label => label.textContent?.trim() === labelText
    );
    if (!label) return null;

    // ラベルの親要素からinput要素を探す
    const container = label.closest('.jss116');
    if (!container) return null;

    // single-line-textクラスを持つdiv内のinputを探す
    const inputContainer = container.querySelector('.single-line-text');
    if (!inputContainer) return null;

    return inputContainer.querySelector('input') || null;
  }

  private findSelectByLabel(labelText: string): HTMLSelectElement | null {
    const label = Array.from(document.querySelectorAll('label')).find(
      label => label.textContent?.trim() === labelText
    );
    if (!label) return null;

    const container = label.closest('div');
    if (!container) return null;

    return container.querySelector('select') || null;
  }

  private findRadioButtonsByLabel(labelText: string): NodeListOf<HTMLInputElement> {
    const label = Array.from(document.querySelectorAll('label')).find(
      label => label.textContent?.trim() === labelText
    );
    if (!label) return document.querySelectorAll('input[type="radio"]');

    // ラベルの親要素からラジオボタンを探す
    const container = label.closest('.jss116');
    if (!container) return document.querySelectorAll('input[type="radio"]');

    // ラジオボタンを含むdivを探す
    const radioContainer = container.querySelector('.jss138');
    if (!radioContainer) return document.querySelectorAll('input[type="radio"]');

    return radioContainer.querySelectorAll('input[type="radio"]');
  }

  fillForm(data: CompanyData): void {
    // テキストフィールドの入力
    Object.entries(data).forEach(([key, value]) => {
    const field = this.formFields[key as keyof FormFields];
      if (field instanceof HTMLInputElement) {
        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // 都道府県の選択
    if (data.prefecture && this.formFields.prefecture) {
      const prefOption = Array.from(this.formFields.prefecture.options)
        .find(option => option.text === data.prefecture);
      if (prefOption) {
        this.formFields.prefecture.value = prefOption.value;
        this.formFields.prefecture.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // アクセス種別の選択
    if (data.accessType) {
      this.formFields.accessType.forEach(radio => {
        if (radio.value === data.accessType) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }
  }
}

const openAIService = new OpenAIService(config.OPENAI_API_KEY);

// メッセージリスナーの設定
chrome.runtime.onMessage.addListener((
  message: { type: string; url: string },
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: { success: boolean; error?: string }) => void
) => {
  if (message.type === 'ANALYZE_COMPANY') {
    (async () => {
      try {
        const companyData = await openAIService.analyzeWebsite(message.url);
        const formFiller = new FormFiller();
        formFiller.fillForm(companyData);
        sendResponse({ success: true });
      } catch (error) {
        console.error('Error:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : '不明なエラーが発生しました' });
      }
    })();
    return true;
  }
}); 