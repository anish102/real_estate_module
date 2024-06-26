/** @odoo-module **/

import { Component, useSubEnv, onWillStart } from "@odoo/owl";
import { Layout } from "@web/search/layout";
import { registry } from "@web/core/registry";
import { getDefaultConfig } from "@web/views/view";
import { useService } from "@web/core/utils/hooks";
import { Domain } from "@web/core/domain";
import { Card } from "./card/card";
import { PieChart } from "./pie_chart/pie_chart";

class AwesomeDashboard extends Component {
  setup() {
    useSubEnv({
      config: {
        ...getDefaultConfig(),
        ...this.env.config,
      },
    });

    this.action = useService("action");
    this.rpc = useService("rpc");
    this.tshirtService = useService("tshirtService");

    this.display = {
      controlPanel: { "top-right": false, "bottom-right": false },
    };

    this.keyToString = {
      average_quantity: "Average amount of t-shirt by order this month",
      average_time:
        "Average time for an order to go from 'new' to 'sent' or 'cancelled'",
      nb_cancelled_orders: "Number of cancelled orders this month",
      nb_new_orders: "Number of new orders this month",
      total_amount: "Total amount of new orders this month",
    };

    onWillStart(async () => {
      this.statistics = await this.tshirtService.loadStatistics();
    });
  }

  openCustomers() {
    this.action.doAction("base.action_partner_form");
  }

  openOrders(title, domain) {
    this.action.doAction({
      type: "ir.actions.act_window",
      name: title,
      res_model: "awesome_tshirt.order",
      domain: new Domain(domain).toList(),
      views: [
        [false, "list"],
        [false, "form"],
      ],
    });
  }

  openLast7DaysNewOrders() {
    let domain =
      "[('create_date','>=',(context_today() - datetime.timedelta(days = 7)).strftime('%Y-%m-%d'))]";

    this.openOrders("Last 7 days orders", domain);
  }

  openLast7DaysCancelledOrders() {
    let domain =
      '[("create_date",">=",(context_today() - datetime.timedelta((days = 7))).strftime("%Y-%m-%d")),("state", "=", "cancelled")]';
    this.openOrders("Last 7 days cancelled orders", domain);
  }
}

AwesomeDashboard.components = { Layout, Card, PieChart };
AwesomeDashboard.template = "awesome_tshirt.clientaction";

registry.category("actions").add("awesome_tshirt.dashboard", AwesomeDashboard);
