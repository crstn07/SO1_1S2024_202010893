#include <linux/module.h> // THIS_MODULE, MODULE_VERSION, ...
#include <linux/init.h>   // module_{init,exit}
#include <linux/proc_fs.h>
#include <linux/sched/signal.h> // for_each_process()
#include <linux/seq_file.h>
#include <linux/fs.h>
#include <linux/sched.h>
#include <linux/mm.h> // get_mm_rss()

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Cristian Daniel Pereira Tezagüic");
MODULE_DESCRIPTION("Informacion del CPU");
MODULE_VERSION("1.0");

struct task_struct *task;       // sched.h para tareas/procesos
struct task_struct *task_child; // index de tareas secundarias
struct list_head *list;         // lista de cada tareas


static int escribir_a_proc(struct seq_file *file_proc, void *v)
{
    unsigned long rss;
    unsigned long total_ram_pages;
    
    
    total_ram_pages = totalram_pages();
    if (!total_ram_pages) {
        pr_err("No memory available\n");
        return -EINVAL;
    }
    
    #ifndef CONFIG_MMU
        pr_err("No MMU, cannot calculate RSS.\n");
        return -EINVAL;
    #endif
    
    unsigned long total_cpu_time = jiffies_to_msecs(get_jiffies_64());
    unsigned long total_usage = 0;

    for_each_process(task) {
        unsigned long cpu_time = jiffies_to_msecs(task->utime + task->stime);
        unsigned long cpu_percentage = (cpu_time * 100) / total_cpu_time;
        total_usage += cpu_time;
    }
    //---------------------------------------------------------------------------
    seq_printf(file_proc, "{\n\"total\":%lu,\n", total_cpu_time);
    seq_printf(file_proc, "\"porcentaje\":%lu,\n", (total_usage * 100) / total_cpu_time);
    seq_printf(file_proc, "\"uso\":%lu,\n", total_usage);
    seq_printf(file_proc, "\"libre\":%lu,\n", total_cpu_time - total_usage);
    seq_printf(file_proc, "\"procesos\":[\n");
    
    // otro codigo
    // unsigned long total_cpu_time = jiffies_to_msecs(get_jiffies_64());
    // unsigned long total_usage = 0;

    // for_each_process(task) {
    //     unsigned long cpu_time = jiffies_to_msecs(task->utime + task->stime);
    //     total_usage += cpu_time;
    // }

    // unsigned long cpu_percentage_used = (total_usage * 100) / total_cpu_time;
    // unsigned long cpu_percentage_unused = 100 - cpu_percentage_used;
    

    int b = 0;

    for_each_process(task)
    {
        if (task->mm)
        {
            rss = get_mm_rss(task->mm) << PAGE_SHIFT;
        }
        else
        {
            rss = 0;
        }
        if (b == 0)
        {
            seq_printf(file_proc, "{");
            b = 1;
        }
        else
        {
            seq_printf(file_proc, ",{");
        }
        seq_printf(file_proc, "\"pid\":%d,\n", task->pid);
        seq_printf(file_proc, "\"nombre\":\"%s\",\n", task->comm);
        seq_printf(file_proc, "\"usuario\": %d,\n", task->cred->uid);
        //seq_printf(file_proc, "\"state\":%ld,\n", task->__state);
        int porcentaje = (rss * 100) / total_ram_pages;
        //seq_printf(file_proc, "\"ram\":%d,\n", porcentaje);

        seq_printf(file_proc, "\"hijo\":[\n");
        int a = 0;
        list_for_each(list, &(task->children))
        {
            task_child = list_entry(list, struct task_struct, sibling);
            if (a != 0)
            {
                seq_printf(file_proc, ",{");
                seq_printf(file_proc, "\"pid\":%d,\n", task_child->pid);
                seq_printf(file_proc, "\"nombre\":\"%s\",\n", task_child->comm);
                //seq_printf(file_proc, "\"state\":%ld,\n", task_child->__state);
                seq_printf(file_proc, "\"pidPadre\":%d\n", task->pid);
                seq_printf(file_proc, "}\n");
            }
            else
            {
                seq_printf(file_proc, "{");
                seq_printf(file_proc, "\"pid\":%d,\n", task_child->pid);
                seq_printf(file_proc, "\"nombre\":\"%s\",\n", task_child->comm);
                //seq_printf(file_proc, "\"state\":%ld,\n", task_child->__state);
                seq_printf(file_proc, "\"pidPadre\":%d\n", task->pid);
                seq_printf(file_proc, "}\n");
                a = 1;
            }
        }
        a = 0;
        seq_printf(file_proc, "\n]}\n");
    }
    b = 0;
    seq_printf(file_proc, "]\n}\n");
    return 0;
}

static int abrir_aproc(struct inode *inode, struct file *file)
{
    return single_open(file, escribir_a_proc, NULL);
}

static struct proc_ops archivo_operaciones = {
    .proc_open = abrir_aproc,
    .proc_read = seq_read
};

static int __init modulo_init(void)
{
    proc_create("cpu_so1_1s2024", 0, NULL, &archivo_operaciones);
    printk(KERN_INFO "Insertar Modulo CPU\n");
    return 0;
}

static void __exit modulo_cleanup(void)
{
    remove_proc_entry("cpu_so1_1s2024", NULL);
    printk(KERN_INFO "Remover Modulo CPU\n");
}

module_init(modulo_init);
module_exit(modulo_cleanup);