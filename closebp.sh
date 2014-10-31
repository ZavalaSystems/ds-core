#!/bin/bash
DISCOVERY=$(curl -s $CORE_URI)
CURRENT_URI=$(echo $DISCOVERY | jshon -e businessperiod -e current -u)
CLOSE_URI=$(echo $DISCOVERY | jshon -e businessperiod -e close -u)
COMMISSIONS_URI=$(curl -s $CURRENT_URI | jshon -e links -e commissions -u)

curl -XPOST $CLOSE_URI
curl -XPOST $COMMISSIONS_URI -d "commit=true"