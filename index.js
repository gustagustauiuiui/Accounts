//externe modules 
const chalk = require('chalk');
const inquirer = require('inquirer');

//core modules
const fs = require('fs');
const { parse } = require('path');

operation();

function operation() {
    inquirer.prompt([{
        type: "list",
        name: 'action',
        message: 'O que voce deseja fazer?',
        choices: [
            'Criar Conta',
            'Consultar Saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ]
    }]).then((answare) => {
        const choice = answare['action'];

        if (choice === 'Criar Conta') {
            criarConta();
        } else if (choice === "Consultar Saldo") {
            consult();
        } else if (choice === "Depositar") {
            deposit();
        } else if (choice === "Sacar") {
            withDraw()
        } else if (choice === "Sair") {
            console.log(chalk.bgBlue.black('Encerrando programa...'));
            process.exit()
        }

    }).catch((err) => console.log(err));
}

//criar conta
function criarConta() {
    console.log(chalk.bgGreen.black('Valeu por escolher o banco certo!!'));
    console.log(chalk.green('Defina as opcoes da sua conta:'));

    buildAccount();
}

function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answare) => {
        const accountName = answare['accountName'];
        console.info(accountName);

        if (!fs.existsSync('usersAccounts')) {
            fs.mkdirSync('usersAccounts')
        }

        if (fs.existsSync(`usersAccounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Essa conta já existe, escolha outro nome'));
            buildAccount()
            return;
        }

        fs.writeFileSync(
            `usersAccounts/${accountName}.json`,
            '{"balance": 0}',
            function (err) {
                console.log(err)
            });

        console.log(chalk.bgGreen.green("Conta criada com sucesso!"));
        operation();
    }).catch((err) => console.log(err));
}

//consultar saldo
function consult() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]
    ).then((answare) => {
        const accountName = answare['accountName'];

        if (!checkAccount(accountName)) {
            return consult();
        }

        const accountData = getAccount(accountName);
        const balance = accountData.balance;

        console.log(chalk.blue(`A conta ${accountName} possui R$${balance} na conta!`));

        operation();

    })
        .catch((err) => console.log(err));
}



//depositar
function deposit() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]
    ).then((answare) => {
        const accountName = answare['accountName'];
        if (!checkAccount(accountName)) {
            return deposit();
        }

        inquirer.prompt(
            [
                {
                    name: 'amount',
                    message: 'Quanto deseja depositar?'
                }
            ]
        )
            .then((answare) => {
                const amount = answare['amount'];
                //add dindin na conta
                addAmount(accountName, amount);

                operation();
            })
            .catch((err) => console.log(err));


    }).catch((err) => console.log(err));
}

//sacar
function withDraw() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answare) => {
        const accountName = answare['accountName'];

        if (!checkAccount(accountName)) {
            return withDraw();
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto deseja sacar?'
            }
        ]).then((answare) => {
            const amount = answare['amount'];

            //retirar o dindin
            tirarDindin(accountName, amount);

            operation()

        }).catch((err) => console.log(err));

    }).catch((err) => console.log(err));
}

//tiraro dindin
function tirarDindin(accountName, amount){
    const accountData = getAccount(accountName);
    
    if (!amount) {
        console.log(chalk.bgRed.black('Ocoreu um erro, tente novamente'));
        return withDraw();
    }

    if(parseFloat(accountData.balance) >= parseFloat(amount)){
        accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);
        fs.writeFileSync(
            `usersAccounts/${accountName}.json`,
            JSON.stringify(accountData),
            function (err) {
                console.log(err);
            }
        )
    } else {
        console.log(chalk.red.black("Valor indisponíovel para saque, tente novamente com um valor menor!"));
        return withDraw();
    }
}


//verificar se conta existe
function checkAccount(accountName) {
    if (!fs.existsSync(`usersAccounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black("Esta conta não existe, tente outro nome!"));
        return false;
    }
    return true
}



//adicionar dindin na conta
function addAmount(accountName, amount) {
    const accountData = getAccount(accountName);

    if (!amount) {
        console.log(chalk.bgRed.black('Ocoreu um erro, tente novamente'));
        return deposit()
    }

    accountData.balance = parseFloat(accountData.balance) + parseFloat(amount);
    fs.writeFileSync(
        `usersAccounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err);
        }
    )

    console.log(chalk.green(`Operação realizada com sucesso!\nValor depositado: R$${amount}`));
}


//pegar as infos da conta (JSON)
function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`usersAccounts/${accountName}.json`,
        {
            encoding: 'utf8',
            flag: 'r'
        })

    return JSON.parse(accountJSON);
}














