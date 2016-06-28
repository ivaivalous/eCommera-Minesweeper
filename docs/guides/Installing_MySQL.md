To download MySQL to your computer running Windows, please visit http://dev.mysql.com/downloads/installer/ and proceed to downloading the installer.

[[https://github.com/ivaivalous/eCommera-Minesweeper/blob/master/docs/guides/images/Installing_MySQL/mysql-step-1.png?raw=true]]


Once downloaded, start the installer.

![TEST](/images/Installing_MySQL/mysql-step-2.png)

Read and accept the license agreement and click next to continue.

On the Choosing a Setup Type screen select Custom. On the next screen, select the options shown on the screenshot below.

[[https://github.com/ivaivalous/eCommera-Minesweeper/tree/master/docs/guides/images/Installing_MySQL/mysql-step-3.png]]

Once the components have been installed, you will be taken to MySQL server setup. Select Development Machine and continue.

[[https://github.com/ivaivalous/eCommera-Minesweeper/tree/master/docs/guides/images/Installing_MySQL/mysql-step-4.png]]

Create a strong password for the root user. Add another user your application is going to use.

[[https://github.com/ivaivalous/eCommera-Minesweeper/tree/master/docs/guides/images/Installing_MySQL/mysql-step-5.png]]

On the Windows Service settings, choose the following configuration:

[[https://github.com/ivaivalous/eCommera-Minesweeper/tree/master/docs/guides/images/Installing_MySQL/mysql-step-6.png]]

Keep the default settings for the Plugins and Extensions step. Finally, on the Apply Server Configuration step, press the Execute button. If all went fine, you will see everything gradually becoming ticked in green.

[[https://github.com/ivaivalous/eCommera-Minesweeper/tree/master/docs/guides/images/Installing_MySQL/mysql-step-7.png]]

Click Finish and you're done with MySQL server configuration. The installer will present a couple of additional screens you can click through. MySQL Workbench will then start.

[[https://github.com/ivaivalous/eCommera-Minesweeper/tree/master/docs/guides/images/Installing_MySQL/mysql-step-8.png]]

Add your local database server as a connection by clicking the plus icon next to the MySQL Connections title. 

[[https://github.com/ivaivalous/eCommera-Minesweeper/tree/master/docs/guides/images/Installing_MySQL/mysql-step-9.png]]

Leave the hostname to be "127.0.0.1" and the port "3306". Enter "minesweeper" as Connection Name. Then press Test Connection to see if your configuration is correct. Workbench will ask you for a password. Enter the password you used when setting up the root user.

You should see the following window:

[[https://github.com/ivaivalous/eCommera-Minesweeper/tree/master/docs/guides/images/Installing_MySQL/mysql-step-10.png]]

Finally, press OK in the Setup New Connection window. Your new connection will now be available in the list of connections in the application.

[[https://github.com/ivaivalous/eCommera-Minesweeper/tree/master/docs/guides/images/Installing_MySQL/mysql-step-11.png]]

Click on the Minesweeper tile to connect to your server. You should see a window like this one:

[[https://github.com/ivaivalous/eCommera-Minesweeper/tree/master/docs/guides/images/Installing_MySQL/mysql-step-12.png]]

You are now ready to go!
