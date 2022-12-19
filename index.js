// Módulos externos
import { default as inquirer } from 'inquirer';
import { default as chalk } from 'chalk';

// Módulos internos;
import { default as fs } from 'fs';

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'actions',
        message: 'O que você deseja fazer?',
        choices: [
          'Criar conta',
          'Consultar saldo',
          'Depositar',
          'Sacar',
          'Sair',
        ],
      },
    ])
    .then((answer) => {
      const action = answer['actions'];

      switch (action) {
        case 'Criar conta':
          createAccount();
          break;
        case 'Consultar saldo':
          getAccountBalance();
          break;
        case 'Depositar':
          deposit();
          break;
        case 'Sacar':
          withdraw();
          break;
        case 'Sair':
          exitProgram();
          break;
      }
    })
    .catch((err) => console.log(err));
}

// Create account
function createAccount() {
  console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'));
  console.log(chalk.green('Defina as opções da sua conta à seguir: '));
  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Digite um nome para a sua conta: ',
      },
    ])
    .then((answer) => {
      const accountName = answer['accountName'];

      console.info(accountName);

      if (!fs.existsSync('accounts')) {
        fs.mkdirSync('accounts');
      }

      if (accountName === '') {
        console.log(
          chalk.bgRed.black('O nome está vazio! Escolha outro nome!'),
        );
        buildAccount();
        return;
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black('Esta conta já existe! Escolha outro nome!'),
        );
        buildAccount();
        return;
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance" : 0}',
        function (err) {
          console.log(err);
        },
      );

      console.log(chalk.green('Parabéns, a sua conta foi criada!'));

      operation();
    })
    .catch((err) => console.log(err));
}

// Show account balance
function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
      },
    ])
    .then((answer) => {
      const accountName = answer['accountName'];

      // Verify if account exist
      if (!checkAccount(accountName)) {
        console.log(chalk.bgRed.black('A conta não existe!'));
        return getAccountBalance();
      }

      const accountData = getAccount(accountName);

      console.log(
        chalk.bgBlue.black(`Olá, o seu saldo é de R$${accountData.balance}`),
      );

      operation();
    })
    .catch((err) => console.log(err));
}

// add an amount to user account
function deposit() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta? ',
      },
    ])
    .then((answer) => {
      const accountName = answer['accountName'];

      // Verify if account exist
      if (!checkAccount(accountName)) {
        deposit();
        return;
      }

      inquirer
        .prompt([
          {
            name: 'amount',
            message: 'Quanto você deseja depositar? ',
          },
        ])
        .then((answer) => {
          const amount = answer['amount'];

          // Add an amount
          addAmount(accountName, amount);
          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(
      chalk.bgRed.black('Esta conta não existe, escolha outro nome!'),
    );
    return false;
  }

  return true;
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'),
    );
    return deposit();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (err) => {
      console.log(err);
    },
  );

  console.log(
    chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`),
  );
}

function getAccount(accountName) {
  const accountJson = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: 'utf-8',
    flag: 'r',
  });

  return JSON.parse(accountJson);
}

// withdraw an amount a user account
function withdraw() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
      },
    ])
    .then((answer) => {
      const accountName = answer['accountName'];

      if (!checkAccount(accountName)) {
        console.log(chalk.bgRed.black('A conta não existe! Tente novamente!'));
        return withdraw();
      }

      inquirer
        .prompt([
          {
            name: 'amount',
            message: 'Quanto você deseja sacar?',
          },
        ])
        .then((answer) => {
          const amount = answer['amount'];

          removeAmount(accountName, amount);
        })
        .catch();
    })
    .catch((err) => console.log(err));
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'),
    );
    return withdraw();
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black('Valor indisponível!'));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `account/${accountName}.json`,
    JSON.stringify(accountData),
    function err() {
      console.log(err);
    },
  );

  console.log(
    chalk.green(`Foi realizado um saque de R$${amount} na sua conta!`),
  );
  operation();
}

// Exit
function exitProgram() {
  console.log(chalk.bgBlue.black('                                     '));
  console.log(chalk.bgBlue.black('  --Obrigado por usar o Accounts!--  '));
  console.log(chalk.bgBlue.black('                                     '));

  process.exit();
}
