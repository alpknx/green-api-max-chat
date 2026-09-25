import { expect, test } from '@playwright/test'

test('login, send a message, receive a reply', async ({ page }) => {
  let notificationServed = false

  await page.route('https://api.green-api.com/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    if (url.includes('/getSettings/')) {
      return route.fulfill({ json: { wid: '123@c.us' } })
    }
    if (url.includes('/sendMessage/') && method === 'POST') {
      return route.fulfill({ json: { idMessage: 'sent-1' } })
    }
    if (url.includes('/receiveNotification/')) {
      if (!notificationServed) {
        notificationServed = true
        return route.fulfill({
          json: {
            receiptId: 99,
            body: {
              typeWebhook: 'incomingMessageReceived',
              timestamp: Math.floor(Date.now() / 1000),
              senderData: { chatId: '79001234567@c.us', senderName: 'Bob' },
              messageData: {
                typeMessage: 'textMessage',
                textMessageData: { textMessage: 'привет в ответ' },
              },
            },
          },
        })
      }
      return route.fulfill({ status: 200, body: '' })
    }
    if (url.includes('/deleteNotification/') && method === 'DELETE') {
      return route.fulfill({ json: { result: true } })
    }
    return route.continue()
  })

  await page.goto('/')

  await page.getByLabel(/idInstance/i).fill('123')
  await page.getByLabel(/apiTokenInstance/i).fill('tok')
  await page.getByRole('button', { name: /войти/i }).click()

  await page.getByPlaceholder(/номер телефона/i).fill('79001234567')
  await page.getByRole('button', { name: '+' }).click()

  await page.getByPlaceholder(/сообщение/i).fill('привет')
  await page.getByRole('button', { name: /отправить/i }).click()

  await expect(page.getByText('привет', { exact: true })).toBeVisible()
  await expect(page.getByText('привет в ответ')).toBeVisible({ timeout: 10000 })
})
