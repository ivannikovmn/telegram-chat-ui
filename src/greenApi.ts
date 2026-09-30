
type GreenApiNotification = {
  receiptId: number
  body: {
    typeWebhook: string
    senderData?: {
      chatId?: string
    }
    messageData?: {
      typeMessage?: string
      textMessageData?: {
        textMessage?: string
      }
    }
  }
}

type CheckAccountResponse = {
  exist?: boolean
  chatId?: string
  status?: boolean
  reason?: string
  data?: {
    reason?: string
    status?: string
    retryAfter?: number
  }
}

function getApiUrl(idInstance: string) {
  return `https://${idInstance.slice(0, 4)}.api.green-api.com/waInstance${idInstance}`
}

export async function checkAccount(
  idInstance: string,
  apiTokenInstance: string,
  phoneNumber: string,
): Promise<string> {
  const response = await fetch(
    `${getApiUrl(idInstance)}/checkAccount/${apiTokenInstance}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: Number(phoneNumber),
      }),
    },
  )

  const result = (await response.json()) as CheckAccountResponse

  if (!response.ok) {
    throw new Error(
      result.reason || result.data?.reason || `HTTP ${response.status}`,
    )
  }

  if (result.status === false) {
    throw new Error(
      result.reason || result.data?.reason || 'Unable to check this account',
    )
  }

  if (!result.exist || !result.chatId) {
    throw new Error(
      'No Telegram account found for this number, or the number is hidden by privacy settings',
    )
  }

  return result.chatId
}

export async function receiveNotification(
  idInstance: string,
  apiTokenInstance: string,
): Promise<GreenApiNotification | null> {
  const response = await fetch(
    `${getApiUrl(idInstance)}/receiveNotification/${apiTokenInstance}`,
  )

  if (response.status === 200) {
    return response.json()
  }

  if (response.status === 204) {
    return null
  }

  throw new Error(`ReceiveNotification failed: HTTP ${response.status}`)
}

export async function deleteNotification(
  idInstance: string,
  apiTokenInstance: string,
  receiptId: number,
): Promise<void> {
  const response = await fetch(
    `${getApiUrl(idInstance)}/deleteNotification/${apiTokenInstance}/${receiptId}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) {
    throw new Error(`DeleteNotification failed: HTTP ${response.status}`)
  }
}