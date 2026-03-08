/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `analytics_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics_reports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `report_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` enum('inventory_summary','stock_movement','purchase_analytics','sales_analytics','warehouse_performance','financial_summary','operational_kpis','custom_report') COLLATE utf8mb4_unicode_ci NOT NULL,
  `frequency` enum('real_time','daily','weekly','monthly','quarterly','yearly','on_demand') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'on_demand',
  `filters` json DEFAULT NULL,
  `metrics` json DEFAULT NULL,
  `visualization_config` json DEFAULT NULL,
  `data` json DEFAULT NULL,
  `summary_stats` json DEFAULT NULL,
  `total_value` decimal(15,2) DEFAULT NULL,
  `total_items` int DEFAULT NULL,
  `status` enum('draft','scheduled','generating','completed','failed','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `generated_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `generation_time_seconds` int DEFAULT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `download_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visibility` enum('private','shared','public') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'private',
  `shared_with_users` json DEFAULT NULL,
  `shared_with_roles` json DEFAULT NULL,
  `auto_generate` tinyint(1) NOT NULL DEFAULT '0',
  `email_on_completion` tinyint(1) NOT NULL DEFAULT '0',
  `email_recipients` json DEFAULT NULL,
  `alert_conditions` json DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `view_count` int NOT NULL DEFAULT '0',
  `last_viewed_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint unsigned NOT NULL,
  `updated_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `analytics_reports_report_code_unique` (`report_code`),
  KEY `analytics_reports_updated_by_foreign` (`updated_by`),
  KEY `analytics_reports_type_status_index` (`type`,`status`),
  KEY `analytics_reports_created_by_status_index` (`created_by`,`status`),
  KEY `analytics_reports_frequency_scheduled_at_index` (`frequency`,`scheduled_at`),
  KEY `analytics_reports_generated_at_index` (`generated_at`),
  FULLTEXT KEY `analytics_reports_title_description_notes_fulltext` (`title`,`description`,`notes`),
  CONSTRAINT `analytics_reports_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `analytics_reports_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `brands_name_unique` (`name`),
  UNIQUE KEY `brands_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `business_insights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_insights` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `insight_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('anomaly_detection','trend_analysis','performance_alert','optimization_suggestion','risk_warning','opportunity_identification','threshold_breach','predictive_insight','seasonal_pattern','correlation_discovery') COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` enum('low','medium','high','critical') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `category` enum('inventory_management','stock_levels','warehouse_operations','purchase_orders','sales_performance','financial_metrics','operational_efficiency','customer_behavior','supplier_performance','general_business') COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_points` json DEFAULT NULL,
  `metrics` json DEFAULT NULL,
  `current_value` decimal(15,2) DEFAULT NULL,
  `threshold_value` decimal(15,2) DEFAULT NULL,
  `percentage_change` decimal(8,2) DEFAULT NULL,
  `trend_direction` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recommendations` json DEFAULT NULL,
  `action_items` json DEFAULT NULL,
  `potential_impact` decimal(15,2) DEFAULT NULL,
  `urgency` enum('low','medium','high','immediate') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `suggested_completion_date` date DEFAULT NULL,
  `source_table` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_record_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `detection_method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `detected_at` timestamp NOT NULL,
  `status` enum('new','acknowledged','in_progress','resolved','dismissed','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `resolution_notes` text COLLATE utf8mb4_unicode_ci,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `is_notified` tinyint(1) NOT NULL DEFAULT '0',
  `notified_users` json DEFAULT NULL,
  `notification_sent_at` timestamp NULL DEFAULT NULL,
  `priority` enum('low','normal','high','critical') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `auto_actionable` tinyint(1) NOT NULL DEFAULT '0',
  `auto_action_config` json DEFAULT NULL,
  `auto_action_executed` tinyint(1) NOT NULL DEFAULT '0',
  `auto_action_executed_at` timestamp NULL DEFAULT NULL,
  `is_recurring` tinyint(1) NOT NULL DEFAULT '0',
  `recurrence_pattern` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `next_check_at` timestamp NULL DEFAULT NULL,
  `occurrence_count` int NOT NULL DEFAULT '1',
  `confidence_score` decimal(5,2) DEFAULT NULL,
  `user_feedback_positive` tinyint(1) DEFAULT NULL,
  `user_feedback_notes` text COLLATE utf8mb4_unicode_ci,
  `related_insights` json DEFAULT NULL,
  `assigned_to` bigint unsigned DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `acknowledged_by` bigint unsigned DEFAULT NULL,
  `resolved_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `business_insights_insight_code_unique` (`insight_code`),
  KEY `business_insights_created_by_foreign` (`created_by`),
  KEY `business_insights_acknowledged_by_foreign` (`acknowledged_by`),
  KEY `business_insights_resolved_by_foreign` (`resolved_by`),
  KEY `business_insights_type_status_index` (`type`,`status`),
  KEY `business_insights_category_severity_index` (`category`,`severity`),
  KEY `business_insights_status_urgency_index` (`status`,`urgency`),
  KEY `business_insights_detected_at_status_index` (`detected_at`,`status`),
  KEY `business_insights_assigned_to_status_index` (`assigned_to`,`status`),
  FULLTEXT KEY `business_insights_title_description_resolution_notes_fulltext` (`title`,`description`,`resolution_notes`),
  CONSTRAINT `business_insights_acknowledged_by_foreign` FOREIGN KEY (`acknowledged_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `business_insights_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `business_insights_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `business_insights_resolved_by_foreign` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `contact_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `contactable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactable_id` bigint unsigned NOT NULL,
  `contact_type` enum('call','email','meeting','visit','message','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'call',
  `direction` enum('inbound','outbound') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'outbound',
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `outcome` enum('successful','no_answer','follow_up_needed','resolved','escalated') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_person_id` bigint unsigned DEFAULT NULL,
  `external_contact_person` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `external_contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `external_contact_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_date` timestamp NOT NULL,
  `duration_minutes` int DEFAULT NULL,
  `follow_up_date` timestamp NULL DEFAULT NULL,
  `attachments` json DEFAULT NULL,
  `priority` enum('low','normal','high','urgent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `tags` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contact_logs_contactable_type_contactable_id_index` (`contactable_type`,`contactable_id`),
  KEY `contact_logs_contact_type_contact_date_index` (`contact_type`,`contact_date`),
  KEY `contact_logs_contact_person_id_index` (`contact_person_id`),
  KEY `contact_logs_follow_up_date_index` (`follow_up_date`),
  CONSTRAINT `contact_logs_contact_person_id_foreign` FOREIGN KEY (`contact_person_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_type` enum('individual','business','government','non_profit') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'business',
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trade_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','suspended','prospect') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'prospect',
  `contact_person` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fax` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_address_line_1` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `billing_address_line_2` text COLLATE utf8mb4_unicode_ci,
  `billing_city` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `billing_state_province` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_postal_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_country` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `same_as_billing` tinyint(1) NOT NULL DEFAULT '1',
  `shipping_address_line_1` text COLLATE utf8mb4_unicode_ci,
  `shipping_address_line_2` text COLLATE utf8mb4_unicode_ci,
  `shipping_city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_state_province` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_postal_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_country` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registration_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_description` text COLLATE utf8mb4_unicode_ci,
  `industry_sectors` json DEFAULT NULL,
  `established_year` int DEFAULT NULL,
  `company_size` enum('startup','small','medium','large','enterprise') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_terms` enum('cod','net_15','net_30','net_45','net_60','prepaid') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'net_30',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `credit_limit` decimal(15,2) NOT NULL DEFAULT '0.00',
  `current_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `available_credit` decimal(15,2) NOT NULL DEFAULT '0.00',
  `credit_status` enum('good','watch','hold','collections') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'good',
  `payment_method` enum('bank_transfer','check','credit_card','cash','invoice') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'invoice',
  `customer_satisfaction_rating` decimal(3,2) NOT NULL DEFAULT '0.00',
  `total_orders` int NOT NULL DEFAULT '0',
  `total_order_value` decimal(15,2) NOT NULL DEFAULT '0.00',
  `average_order_value` decimal(15,2) NOT NULL DEFAULT '0.00',
  `lifetime_value` decimal(15,2) NOT NULL DEFAULT '0.00',
  `payment_delay_days_average` int NOT NULL DEFAULT '0',
  `return_rate_percentage` int NOT NULL DEFAULT '0',
  `complaint_count` int NOT NULL DEFAULT '0',
  `assigned_sales_rep` bigint unsigned DEFAULT NULL,
  `customer_priority` enum('low','normal','high','vip') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `lead_source` enum('website','referral','cold_call','trade_show','advertisement','social_media','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `special_requirements` text COLLATE utf8mb4_unicode_ci,
  `preferred_delivery_methods` json DEFAULT NULL,
  `price_tier` enum('standard','bronze','silver','gold','platinum') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'standard',
  `default_discount_percentage` decimal(5,2) NOT NULL DEFAULT '0.00',
  `volume_discount_eligible` tinyint(1) NOT NULL DEFAULT '0',
  `seasonal_discount_eligible` tinyint(1) NOT NULL DEFAULT '0',
  `communication_preferences` json DEFAULT NULL,
  `marketing_preferences` json DEFAULT NULL,
  `newsletter_subscription` tinyint(1) NOT NULL DEFAULT '0',
  `customer_categories` json DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `internal_notes` text COLLATE utf8mb4_unicode_ci,
  `sales_notes` text COLLATE utf8mb4_unicode_ci,
  `tax_exempt` tinyint(1) NOT NULL DEFAULT '0',
  `tax_exempt_certificate` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint unsigned NOT NULL,
  `updated_by` bigint unsigned DEFAULT NULL,
  `last_order_date` timestamp NULL DEFAULT NULL,
  `last_contact_date` timestamp NULL DEFAULT NULL,
  `first_purchase_date` timestamp NULL DEFAULT NULL,
  `contract_start_date` date DEFAULT NULL,
  `contract_end_date` date DEFAULT NULL,
  `contract_type` enum('one_time','short_term','long_term','enterprise') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customers_customer_code_unique` (`customer_code`),
  KEY `customers_created_by_foreign` (`created_by`),
  KEY `customers_updated_by_foreign` (`updated_by`),
  KEY `customers_status_customer_type_index` (`status`,`customer_type`),
  KEY `customers_billing_country_billing_city_index` (`billing_country`,`billing_city`),
  KEY `customers_credit_status_index` (`credit_status`),
  KEY `customers_customer_priority_index` (`customer_priority`),
  KEY `customers_assigned_sales_rep_index` (`assigned_sales_rep`),
  KEY `customers_created_at_index` (`created_at`),
  KEY `customers_last_order_date_index` (`last_order_date`),
  FULLTEXT KEY `customers_search_fulltext` (`company_name`,`trade_name`,`first_name`,`last_name`,`contact_person`),
  CONSTRAINT `customers_assigned_sales_rep_foreign` FOREIGN KEY (`assigned_sales_rep`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `customers_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `customers_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `dashboard_widgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dashboard_widgets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `widget_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` enum('kpi_card','line_chart','bar_chart','pie_chart','area_chart','gauge_chart','heatmap','data_table','alert_list','quick_actions','custom_widget') COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_source` enum('inventory_levels','stock_movements','purchase_orders','sales_orders','warehouse_metrics','financial_metrics','user_activity','custom_query') COLLATE utf8mb4_unicode_ci NOT NULL,
  `query_config` json DEFAULT NULL,
  `filters` json DEFAULT NULL,
  `chart_config` json DEFAULT NULL,
  `cached_data` json DEFAULT NULL,
  `data_cached_at` timestamp NULL DEFAULT NULL,
  `cache_duration_minutes` int NOT NULL DEFAULT '15',
  `real_time_config` json DEFAULT NULL,
  `size` enum('small','medium','large','extra_large') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `grid_position_x` int NOT NULL DEFAULT '0',
  `grid_position_y` int NOT NULL DEFAULT '0',
  `grid_width` int NOT NULL DEFAULT '4',
  `grid_height` int NOT NULL DEFAULT '3',
  `styling_config` json DEFAULT NULL,
  `dashboard_type` enum('executive','operational','financial','warehouse','custom') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'operational',
  `display_order` int NOT NULL DEFAULT '0',
  `visibility` enum('private','shared','public') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'shared',
  `visible_to_roles` json DEFAULT NULL,
  `visible_to_users` json DEFAULT NULL,
  `is_interactive` tinyint(1) NOT NULL DEFAULT '0',
  `allows_drill_down` tinyint(1) NOT NULL DEFAULT '0',
  `drill_down_config` json DEFAULT NULL,
  `allows_export` tinyint(1) NOT NULL DEFAULT '1',
  `status` enum('active','inactive','maintenance','error') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `load_time_ms` int DEFAULT NULL,
  `last_updated_at` timestamp NULL DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `has_alerts` tinyint(1) NOT NULL DEFAULT '0',
  `alert_thresholds` json DEFAULT NULL,
  `alert_recipients` json DEFAULT NULL,
  `view_count` int NOT NULL DEFAULT '0',
  `last_viewed_at` timestamp NULL DEFAULT NULL,
  `interaction_count` int NOT NULL DEFAULT '0',
  `created_by` bigint unsigned NOT NULL,
  `updated_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dashboard_widgets_widget_code_unique` (`widget_code`),
  KEY `dashboard_widgets_created_by_foreign` (`created_by`),
  KEY `dashboard_widgets_updated_by_foreign` (`updated_by`),
  KEY `dashboard_widgets_dashboard_type_status_index` (`dashboard_type`,`status`),
  KEY `dashboard_widgets_type_data_source_index` (`type`,`data_source`),
  KEY `dashboard_widgets_display_order_status_index` (`display_order`,`status`),
  KEY `dashboard_widgets_last_updated_at_index` (`last_updated_at`),
  CONSTRAINT `dashboard_widgets_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `dashboard_widgets_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `inventories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned NOT NULL,
  `quantity_on_hand` int NOT NULL DEFAULT '0',
  `quantity_reserved` int NOT NULL DEFAULT '0',
  `quantity_available` int NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventories_product_id_warehouse_id_unique` (`product_id`,`warehouse_id`),
  KEY `inventories_warehouse_id_foreign` (`warehouse_id`),
  CONSTRAINT `inventories_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventories_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `check_positive_quantity_available` CHECK ((`quantity_available` >= 0)),
  CONSTRAINT `check_positive_quantity_on_hand` CHECK ((`quantity_on_hand` >= 0)),
  CONSTRAINT `check_positive_quantity_reserved` CHECK ((`quantity_reserved` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `inventory_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_movements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned NOT NULL,
  `type` enum('stock_in','stock_out','adjustment_in','adjustment_out','transfer_in','transfer_out','increase','decrease') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `quantity_before` int NOT NULL,
  `quantity_after` int NOT NULL,
  `reference_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint unsigned DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `movement_date` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_movements_product_id_foreign` (`product_id`),
  KEY `inventory_movements_warehouse_id_foreign` (`warehouse_id`),
  CONSTRAINT `inventory_movements_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_movements_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint unsigned NOT NULL,
  `brand_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `min_stock_level` int NOT NULL DEFAULT '0',
  `max_stock_level` int DEFAULT NULL,
  `images` json DEFAULT NULL,
  `specifications` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `track_quantity` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug_unique` (`slug`),
  UNIQUE KEY `products_sku_unique` (`sku`),
  UNIQUE KEY `products_barcode_unique` (`barcode`),
  KEY `products_category_id_foreign` (`category_id`),
  KEY `products_brand_id_foreign` (`brand_id`),
  CONSTRAINT `products_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE,
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `purchase_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `purchase_order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `product_sku` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_description` text COLLATE utf8mb4_unicode_ci,
  `quantity_ordered` int NOT NULL,
  `quantity_received` int NOT NULL DEFAULT '0',
  `quantity_pending` int NOT NULL,
  `unit_cost` decimal(10,4) NOT NULL,
  `line_total` decimal(12,4) NOT NULL,
  `discount_percentage` decimal(5,4) NOT NULL DEFAULT '0.0000',
  `discount_amount` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `final_line_total` decimal(12,4) NOT NULL,
  `item_status` enum('pending','partially_received','fully_received','cancelled','backordered') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `expected_delivery_date` date DEFAULT NULL,
  `last_received_at` timestamp NULL DEFAULT NULL,
  `receiving_notes` text COLLATE utf8mb4_unicode_ci,
  `quantity_rejected` int NOT NULL DEFAULT '0',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `purchase_order_items_purchase_order_id_product_id_index` (`purchase_order_id`,`product_id`),
  KEY `purchase_order_items_product_id_created_at_index` (`product_id`,`created_at`),
  KEY `purchase_order_items_item_status_created_at_index` (`item_status`,`created_at`),
  KEY `purchase_order_items_expected_delivery_date_index` (`expected_delivery_date`),
  KEY `purchase_order_items_product_sku_index` (`product_sku`),
  CONSTRAINT `purchase_order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_order_items_purchase_order_id_foreign` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `po_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_address` text COLLATE utf8mb4_unicode_ci,
  `supplier_contact_person` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','pending_approval','approved','sent_to_supplier','partially_received','fully_received','cancelled','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `priority` enum('low','normal','high','urgent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `warehouse_id` bigint unsigned NOT NULL,
  `created_by` bigint unsigned NOT NULL,
  `approved_by` bigint unsigned DEFAULT NULL,
  `received_by` bigint unsigned DEFAULT NULL,
  `subtotal` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `tax_rate` decimal(5,4) NOT NULL DEFAULT '0.0000',
  `tax_amount` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `shipping_cost` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `discount_amount` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `total_amount` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `expected_delivery_date` date DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `received_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `terms_and_conditions` text COLLATE utf8mb4_unicode_ci,
  `cancellation_reason` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `is_recurring` tinyint(1) NOT NULL DEFAULT '0',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchase_orders_po_number_unique` (`po_number`),
  KEY `purchase_orders_approved_by_foreign` (`approved_by`),
  KEY `purchase_orders_received_by_foreign` (`received_by`),
  KEY `purchase_orders_status_created_at_index` (`status`,`created_at`),
  KEY `purchase_orders_warehouse_id_created_at_index` (`warehouse_id`,`created_at`),
  KEY `purchase_orders_created_by_created_at_index` (`created_by`,`created_at`),
  KEY `purchase_orders_expected_delivery_date_index` (`expected_delivery_date`),
  KEY `purchase_orders_supplier_name_created_at_index` (`supplier_name`,`created_at`),
  KEY `purchase_orders_po_number_index` (`po_number`),
  CONSTRAINT `purchase_orders_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `purchase_orders_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_orders_received_by_foreign` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `purchase_orders_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `sales_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sales_order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `inventory_id` bigint unsigned DEFAULT NULL,
  `product_sku` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_description` text COLLATE utf8mb4_unicode_ci,
  `quantity_ordered` int NOT NULL,
  `quantity_fulfilled` int NOT NULL DEFAULT '0',
  `quantity_shipped` int NOT NULL DEFAULT '0',
  `quantity_pending` int NOT NULL,
  `quantity_backordered` int NOT NULL DEFAULT '0',
  `unit_price` decimal(10,4) NOT NULL,
  `line_total` decimal(12,4) NOT NULL,
  `discount_percentage` decimal(5,4) NOT NULL DEFAULT '0.0000',
  `discount_amount` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `final_line_total` decimal(12,4) NOT NULL,
  `item_status` enum('pending','confirmed','allocated','partially_fulfilled','fully_fulfilled','shipped','delivered','cancelled','backordered') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `requested_delivery_date` date DEFAULT NULL,
  `promised_delivery_date` date DEFAULT NULL,
  `allocated_at` timestamp NULL DEFAULT NULL,
  `fulfilled_at` timestamp NULL DEFAULT NULL,
  `shipped_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `fulfillment_notes` text COLLATE utf8mb4_unicode_ci,
  `requires_allocation` tinyint(1) NOT NULL DEFAULT '1',
  `allocated_quantity` int NOT NULL DEFAULT '0',
  `allocation_expires_at` timestamp NULL DEFAULT NULL,
  `quantity_returned` int NOT NULL DEFAULT '0',
  `return_reason` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `customer_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sales_order_items_sales_order_id_product_id_index` (`sales_order_id`,`product_id`),
  KEY `sales_order_items_product_id_created_at_index` (`product_id`,`created_at`),
  KEY `sales_order_items_inventory_id_created_at_index` (`inventory_id`,`created_at`),
  KEY `sales_order_items_item_status_created_at_index` (`item_status`,`created_at`),
  KEY `sales_order_items_requested_delivery_date_index` (`requested_delivery_date`),
  KEY `sales_order_items_promised_delivery_date_index` (`promised_delivery_date`),
  KEY `sales_order_items_product_sku_index` (`product_sku`),
  KEY `sales_order_items_requires_allocation_allocated_quantity_index` (`requires_allocation`,`allocated_quantity`),
  KEY `sales_order_items_allocation_expires_at_index` (`allocation_expires_at`),
  CONSTRAINT `sales_order_items_inventory_id_foreign` FOREIGN KEY (`inventory_id`) REFERENCES `inventories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sales_order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sales_order_items_sales_order_id_foreign` FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `sales_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `so_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_address` text COLLATE utf8mb4_unicode_ci,
  `customer_contact_person` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','pending_approval','approved','confirmed','partially_fulfilled','fully_fulfilled','shipped','delivered','cancelled','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `priority` enum('low','normal','high','urgent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `warehouse_id` bigint unsigned NOT NULL,
  `created_by` bigint unsigned NOT NULL,
  `approved_by` bigint unsigned DEFAULT NULL,
  `fulfilled_by` bigint unsigned DEFAULT NULL,
  `shipped_by` bigint unsigned DEFAULT NULL,
  `subtotal` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `tax_rate` decimal(5,4) NOT NULL DEFAULT '0.0000',
  `tax_amount` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `shipping_cost` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `discount_amount` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `total_amount` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `requested_delivery_date` date DEFAULT NULL,
  `promised_delivery_date` date DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `fulfilled_at` timestamp NULL DEFAULT NULL,
  `shipped_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `shipping_address` text COLLATE utf8mb4_unicode_ci,
  `shipping_method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tracking_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `carrier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `customer_notes` text COLLATE utf8mb4_unicode_ci,
  `terms_and_conditions` text COLLATE utf8mb4_unicode_ci,
  `cancellation_reason` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `is_recurring` tinyint(1) NOT NULL DEFAULT '0',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `payment_terms` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` enum('pending','partial','paid','overdue','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sales_orders_so_number_unique` (`so_number`),
  KEY `sales_orders_approved_by_foreign` (`approved_by`),
  KEY `sales_orders_fulfilled_by_foreign` (`fulfilled_by`),
  KEY `sales_orders_shipped_by_foreign` (`shipped_by`),
  KEY `sales_orders_status_created_at_index` (`status`,`created_at`),
  KEY `sales_orders_warehouse_id_created_at_index` (`warehouse_id`,`created_at`),
  KEY `sales_orders_created_by_created_at_index` (`created_by`,`created_at`),
  KEY `sales_orders_requested_delivery_date_index` (`requested_delivery_date`),
  KEY `sales_orders_promised_delivery_date_index` (`promised_delivery_date`),
  KEY `sales_orders_customer_name_created_at_index` (`customer_name`,`created_at`),
  KEY `sales_orders_so_number_index` (`so_number`),
  KEY `sales_orders_payment_status_created_at_index` (`payment_status`,`created_at`),
  KEY `sales_orders_tracking_number_index` (`tracking_number`),
  CONSTRAINT `sales_orders_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sales_orders_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sales_orders_fulfilled_by_foreign` FOREIGN KEY (`fulfilled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sales_orders_shipped_by_foreign` FOREIGN KEY (`shipped_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sales_orders_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `stock_adjustments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_adjustments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `inventory_id` bigint unsigned NOT NULL,
  `adjustment_type` enum('increase','decrease') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_adjusted` int NOT NULL,
  `quantity_before` int NOT NULL,
  `quantity_after` int NOT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `reference_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adjusted_by` bigint unsigned NOT NULL,
  `adjusted_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_adjustments_reference_number_unique` (`reference_number`),
  KEY `stock_adjustments_inventory_id_adjusted_at_index` (`inventory_id`,`adjusted_at`),
  KEY `stock_adjustments_adjusted_by_adjusted_at_index` (`adjusted_by`,`adjusted_at`),
  KEY `stock_adjustments_adjustment_type_index` (`adjustment_type`),
  CONSTRAINT `stock_adjustments_adjusted_by_foreign` FOREIGN KEY (`adjusted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_adjustments_inventory_id_foreign` FOREIGN KEY (`inventory_id`) REFERENCES `inventories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_movements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `warehouse_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `reference_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `movement_type` enum('adjustment_increase','adjustment_decrease','transfer_in','transfer_out','purchase_receive','sale_fulfill','return_customer','return_supplier','damage_write_off','expiry_write_off') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_before` int NOT NULL,
  `quantity_moved` int NOT NULL,
  `quantity_after` int NOT NULL,
  `unit_cost` decimal(10,4) DEFAULT NULL,
  `total_value` decimal(12,4) DEFAULT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `related_document_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_document_id` bigint unsigned DEFAULT NULL,
  `status` enum('pending','approved','rejected','applied') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approved_by` bigint unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_movements_reference_number_unique` (`reference_number`),
  KEY `stock_movements_warehouse_id_foreign` (`warehouse_id`),
  KEY `stock_movements_approved_by_foreign` (`approved_by`),
  KEY `stock_movements_product_id_warehouse_id_index` (`product_id`,`warehouse_id`),
  KEY `stock_movements_movement_type_created_at_index` (`movement_type`,`created_at`),
  KEY `stock_movements_related_document_type_related_document_id_index` (`related_document_type`,`related_document_id`),
  KEY `stock_movements_user_id_created_at_index` (`user_id`,`created_at`),
  CONSTRAINT `stock_movements_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `stock_movements_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_movements_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_movements_warehouse_id_foreign` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `stock_transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_transfers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `from_warehouse_id` bigint unsigned NOT NULL,
  `to_warehouse_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `quantity_transferred` int NOT NULL,
  `transfer_status` enum('pending','approved','in_transit','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `reference_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `initiated_by` bigint unsigned NOT NULL,
  `approved_by` bigint unsigned DEFAULT NULL,
  `completed_by` bigint unsigned DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `cancellation_reason` text COLLATE utf8mb4_unicode_ci,
  `initiated_at` timestamp NOT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_transfers_reference_number_unique` (`reference_number`),
  KEY `stock_transfers_initiated_by_foreign` (`initiated_by`),
  KEY `stock_transfers_approved_by_foreign` (`approved_by`),
  KEY `stock_transfers_completed_by_foreign` (`completed_by`),
  KEY `stock_transfers_transfer_status_created_at_index` (`transfer_status`,`created_at`),
  KEY `stock_transfers_from_warehouse_id_created_at_index` (`from_warehouse_id`,`created_at`),
  KEY `stock_transfers_to_warehouse_id_created_at_index` (`to_warehouse_id`,`created_at`),
  KEY `stock_transfers_product_id_created_at_index` (`product_id`,`created_at`),
  KEY `stock_transfers_reference_number_index` (`reference_number`),
  CONSTRAINT `stock_transfers_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `stock_transfers_completed_by_foreign` FOREIGN KEY (`completed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `stock_transfers_from_warehouse_id_foreign` FOREIGN KEY (`from_warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_transfers_initiated_by_foreign` FOREIGN KEY (`initiated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_transfers_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_transfers_to_warehouse_id_foreign` FOREIGN KEY (`to_warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `supplier_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trade_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_type` enum('manufacturer','distributor','wholesaler','retailer','service_provider') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'distributor',
  `status` enum('active','inactive','blacklisted','pending_approval') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_approval',
  `contact_person` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mobile` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fax` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line_1` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line_2` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state_province` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registration_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_description` text COLLATE utf8mb4_unicode_ci,
  `certifications` json DEFAULT NULL,
  `established_year` int DEFAULT NULL,
  `payment_terms` enum('cod','net_15','net_30','net_45','net_60','net_90','prepaid') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'net_30',
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `credit_limit` decimal(15,2) NOT NULL DEFAULT '0.00',
  `current_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `payment_method` enum('bank_transfer','check','credit_card','cash','letter_of_credit') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_routing_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `overall_rating` decimal(3,2) NOT NULL DEFAULT '0.00',
  `quality_rating` decimal(3,2) NOT NULL DEFAULT '0.00',
  `delivery_rating` decimal(3,2) NOT NULL DEFAULT '0.00',
  `service_rating` decimal(3,2) NOT NULL DEFAULT '0.00',
  `total_orders` int NOT NULL DEFAULT '0',
  `total_order_value` decimal(15,2) NOT NULL DEFAULT '0.00',
  `average_order_value` decimal(15,2) NOT NULL DEFAULT '0.00',
  `on_time_delivery_percentage` int NOT NULL DEFAULT '0',
  `quality_issues_count` int NOT NULL DEFAULT '0',
  `standard_lead_time` int DEFAULT NULL,
  `rush_order_lead_time` int DEFAULT NULL,
  `minimum_order_value` decimal(15,2) DEFAULT NULL,
  `tax_exempt` tinyint(1) NOT NULL DEFAULT '0',
  `required_documents` json DEFAULT NULL,
  `insurance_expiry` date DEFAULT NULL,
  `shipping_methods` json DEFAULT NULL,
  `product_categories` json DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `internal_notes` text COLLATE utf8mb4_unicode_ci,
  `special_instructions` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint unsigned NOT NULL,
  `updated_by` bigint unsigned DEFAULT NULL,
  `last_order_date` timestamp NULL DEFAULT NULL,
  `last_contact_date` timestamp NULL DEFAULT NULL,
  `contract_start_date` date DEFAULT NULL,
  `contract_end_date` date DEFAULT NULL,
  `contract_type` enum('one_time','short_term','long_term','preferred_vendor') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `suppliers_supplier_code_unique` (`supplier_code`),
  KEY `suppliers_created_by_foreign` (`created_by`),
  KEY `suppliers_updated_by_foreign` (`updated_by`),
  KEY `suppliers_status_supplier_type_index` (`status`,`supplier_type`),
  KEY `suppliers_country_city_index` (`country`,`city`),
  KEY `suppliers_overall_rating_index` (`overall_rating`),
  KEY `suppliers_created_at_index` (`created_at`),
  KEY `suppliers_last_order_date_index` (`last_order_date`),
  FULLTEXT KEY `suppliers_search_fulltext` (`company_name`,`trade_name`,`contact_person`),
  CONSTRAINT `suppliers_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `suppliers_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `warehouses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postal_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `warehouses_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (1,'0001_01_01_000000_create_users_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (2,'0001_01_01_000001_create_cache_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (3,'0001_01_01_000002_create_jobs_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (4,'2025_09_13_154336_add_type_to_users',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (5,'2025_09_13_174339_create_categories_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (6,'2025_09_17_134339_create_brands_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (7,'2025_09_18_183402_modify_brands_table_make_logo_and_website_nullable',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (8,'2025_09_20_135638_create_products_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (9,'2025_10_01_124955_create_warehouses_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (10,'2025_10_01_125148_create_inventories_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (11,'2025_10_01_125421_create_inventory_movements_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (12,'2025_10_25_111831_add_notes_to_inventories_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (13,'2025_10_26_063506_create_stock_adjustments_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (14,'2025_10_27_120901_create_stock_transfers_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (15,'2025_10_27_154512_update_inventory_movements_enum_types',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (16,'2025_11_08_180938_create_stock_movements_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (17,'2025_11_11_074516_create_purchase_orders_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (18,'2025_11_11_075250_create_purchase_order_items_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (19,'2025_11_17_091450_create_sales_orders_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (20,'2025_11_17_091609_create_sales_order_items_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (21,'2025_12_04_085457_create_suppliers_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (22,'2025_12_04_085838_create_customers_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (23,'2025_12_04_130850_create_contact_logs_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (24,'2025_12_08_043659_create_analytics_reports_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (25,'2025_12_08_043749_create_dashboard_widgets_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (26,'2025_12_08_043759_create_business_insights_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (27,'2026_03_07_083406_add_positive_quantity_constraint_to_inventories',1);
