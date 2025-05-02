export interface CompanyData {
  jobTitle: string;
  workplaceName: string;
  phoneNumber: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  buildingName: string;
  nearestStation: string;
  accessType: string;
}

class OpenAIService {
  private apiKey: string;
  private apiEndpoint: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
  }

  async analyzeWebsite(url: string): Promise<CompanyData> {
    const prompt = `
      以下のWebサイトURLから企業情報を抽出し、求人情報フォーム用にJSONフォーマットで整理してください：
      ${url}

      必要な情報：
      - 求人タイトル: 企業の情報、業種を元に、求人にふさわしいタイトルを作成してください。
      - 勤務先名称
      - 勤務先電話番号
      - 郵便番号
      - 都道府県
      - 市区町村
      - 丁目番地
      - 建物名
      - 最寄り駅
      - アクセス種別（徒歩、タクシー、バス）
    `;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'あなたはWebサイトから企業情報を抽出し、構造化されたデータを提供する専門家です。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "company_data_schema",
              schema: {
                type: "object",
                properties: {
                  jobTitle: {
                    type: "string",
                    description: "求人タイトル"
                  },
                  workplaceName: {
                    type: "string",
                    description: "勤務先名称"
                  },
                  phoneNumber: {
                    type: "string",
                    description: "勤務先電話番号"
                  },
                  postalCode: {
                    type: "string",
                    description: "郵便番号"
                  },
                  prefecture: {
                    type: "string",
                    description: "都道府県"
                  },
                  city: {
                    type: "string",
                    description: "市区町村"
                  },
                  address: {
                    type: "string",
                    description: "丁目番地"
                  },
                  buildingName: {
                    type: "string",
                    description: "建物名"
                  },
                  nearestStation: {
                    type: "string",
                    description: "最寄り駅"
                  },
                  accessType: {
                    type: "string",
                    description: "アクセス種別（徒歩、タクシー、バス）"
                  }
                },
                additionalProperties: false
              }
            }
          },
          temperature: 0.3
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`OpenAI APIリクエストに失敗しました: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content) as CompanyData;  // 文字列をパースしてCompanyData型に変換
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
}

export default OpenAIService; 