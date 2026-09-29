type GreenApiNotification = {
  receiptId: number
  body: {
    typeWebhook: string
    messageData?: {
      typeMessage?: string
      textMessageData?: {
        textMessage?: string
      }
    }
  }
}

export async function receiveNotification(
  idInstance: string,
  apiTokenInstance: string,
): Promise<GreenApiNotification | null> {
  const response = await fetch(
    `https://${idInstance.slice(0, 4)}.api.green-api.com/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`,
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
    `https://${idInstance.slice(0, 4)}.api.green-api.com/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) {
    throw new Error(`DeleteNotification failed: HTTP ${response.status}`)
  }
}